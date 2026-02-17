from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os
import json
import razorpay
import datetime
from utils import *;
from models import db, User, Product, Cart, Order, OrderItem, Review, Coupon, Wishlist
from flask_migrate import Migrate
from email_service import EmailService



def create_app():

    app = Flask(__name__)
    CORS(app)

    # ================= CONFIG =================

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-this-later")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI", "sqlite:///database.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Razorpay Config
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # Google OAuth Config
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

    # ================= INIT =================

    db.init_app(app)
    JWTManager(app)
    
    # Initialize Razorpay
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    with app.app_context():
        db.create_all()


    # ================= DECORATORS =================
    migrate = Migrate(app, db)

    def admin_required(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            if not user or not user.is_admin:
                return {"msg": "Admin access required"}, 403
            return f(*args, **kwargs)
        return decorated_function

    # ================= HOME =================

    @app.route("/")
    def home():
        return {"msg": "Backend running"}

    # ================= AUTH =================

    @app.route("/register", methods=["POST"])
    def register():
        try:
            data = request.json
            
            if not data.get("email") or not data.get("password") or not data.get("name"):
                return {"msg": "Missing required fields"}, 400
            
            existing_user = User.query.filter_by(email=data["email"]).first()
            if existing_user:
                return {"msg": "Email already registered"}, 400
            
            user = User(
                name=data["name"],
                email=data["email"],
                phone=data.get("phone", "")
            )
            user.set_password(data["password"])
            
            db.session.add(user)
            db.session.commit()
            
            token = create_access_token(identity=str(user.id))

            return {"msg": "Registered successfully", "token": token, "user_id": user.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500

    @app.route("/login", methods=["POST"])
    def login():
        try:
            data = request.json
            
            user = User.query.filter_by(email=data.get("email")).first()
            
            if not user or not user.password:
                return {"msg": "Invalid credentials"}, 401
            
            if not user.check_password(data.get("password", "")):
                return {"msg": "Invalid credentials"}, 401
            
            token = create_access_token(identity=str(user.id))

            
            return {
                "msg": "Login successful",
                "token": token,
                "user_id": user.id,
                "is_admin": user.is_admin
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/google-login", methods=["POST"])
    def google_login():
        try:
            data = request.json
            google_id = data.get("google_id")
            email = data.get("email")
            name = data.get("name")
            
            user = User.query.filter_by(google_id=google_id).first()
            
            if not user:
                user = User.query.filter_by(email=email).first()
                if user:
                    user.google_id = google_id
                else:
                    user = User(
                        name=name,
                        email=email,
                        google_id=google_id
                    )
                db.session.add(user)
                db.session.commit()
            
            token = create_access_token(identity=str(user.id))

            
            return {
                "msg": "Login successful",
                "token": token,
                "user_id": user.id,
                "is_admin": user.is_admin
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/verify-token", methods=["POST"])
    @jwt_required()
    def verify_token():
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if user:
            return {
                "user_id": user.id,
                "email": user.email,
                "name": user.name,
                "is_admin": user.is_admin
            }, 200
        return {"msg": "User not found"}, 404

    # ================= PRODUCTS (USER) =================

    @app.route("/products", methods=["GET"])
    def get_products():
        try:
            category = request.args.get("category")
            search = request.args.get("search")
            
            query = Product.query
            
            if category:
                query = query.filter_by(category=category)
            if search:
                query = query.filter(Product.name.ilike(f"%{search}%"))
            
            products = query.all()
            
            data = []
            for p in products:
                data.append({
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "price": p.price,
                    "image": p.image,
                    "colors": p.colors.split(",") if p.colors else [],
                    "sizes": p.sizes.split(",") if p.sizes else [],
                    "stock": p.stock,
                    "category": p.category,
                    "rating": p.rating,
                    "reviews_count": p.reviews_count
                })
            
            return jsonify(data), 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/product/<int:id>", methods=["GET"])
    def get_product(id):
        try:
            product = Product.query.get(id)
            if not product:
                return {"msg": "Product not found"}, 404
            
            reviews = Review.query.filter_by(product_id=id).all()
            
            review_data = []
            for r in reviews:
                user = User.query.get(r.user_id)
                review_data.append({
                    "id": r.id,
                    "user_name": user.name if user else "Anonymous",
                    "rating": r.rating,
                    "comment": r.comment,
                    "created_at": r.created_at.isoformat()
                })
            
            return {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "image": product.image,
                "colors": product.colors.split(",") if product.colors else [],
                "sizes": product.sizes.split(",") if product.sizes else [],
                "stock": product.stock,
                "category": product.category,
                "supplier": product.supplier,
                "rating": product.rating,
                "reviews_count": product.reviews_count,
                "reviews": review_data
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500

    # ================= PRODUCTS (ADMIN) =================

    
    @app.route("/admin/product", methods=["POST"])
    @admin_required
    def add_product():
        """
        Add a new product with comprehensive details.
        Supports both legacy and new field structures.
        """
        try:
            data = request.json
            
            # Handle images - support both single image (legacy) and multiple images (new)
            images = data.get("images", [])
            primary_image = data.get("image", "")
            
            # If images array is provided, use it; otherwise fall back to single image
            if images and len(images) > 0:
                primary_image = images[0]
                all_images = serialize_comma_list(images)
            else:
                all_images = primary_image
            
            # Create product with all fields
            product = Product(
                # Basic Information
                name=data.get("name"),
                description=data.get("description", ""),
                category=data.get("category", ""),
                brand=data.get("brand", ""),
                sku=data.get("sku", ""),
                status=data.get("status", "active"),
                
                # Collection Categories
                is_women=data.get("is_women", False),
                is_men=data.get("is_men", False),
                is_studio=data.get("is_studio", False),
                is_new=data.get("is_new", False),
                is_unisex=data.get("is_unisex", False),
                
                # Pricing
                price=data.get("price"),
                cost_price=data.get("costPrice"),
                discount=data.get("discount"),
                tax_rate=data.get("taxRate"),
                
                # Media
                image=primary_image,  # Primary image for backward compatibility
                images=all_images,    # All images as comma-separated string
                
                # Variants
                colors=serialize_comma_list(data.get("colors", [])),
                sizes=serialize_comma_list(data.get("sizes", [])),
                
                # Inventory
                stock=data.get("stock", 0),
                supplier=data.get("supplier", ""),
                min_order_quantity=data.get("minOrderQuantity"),
                max_order_quantity=data.get("maxOrderQuantity"),
                
                # Product Details
                weight=data.get("weight"),
                dimensions=serialize_json_field(data.get("dimensions", {})),
                specifications=serialize_json_field(data.get("specifications", [])),
                
                # Marketing
                tags=serialize_comma_list(data.get("tags", [])),
                featured=data.get("featured", False),
                
                # Policies
                warranty=data.get("warranty", ""),
                return_policy=data.get("returnPolicy", ""),
                
                # Shipping
                shipping_class=data.get("shippingClass", ""),
            )
            
            db.session.add(product)
            db.session.commit()
            
            return {
                "msg": "Product added successfully",
                "product_id": product.id
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    

    @app.route("/admin/products", methods=["GET"])
    @admin_required
    def admin_products():
        """
        Get all products with full details.
        Returns both legacy and new field formats for compatibility.
        """
        try:
            products = Product.query.all()
            data = []
            
            for p in products:
                # Parse images
                images_list = parse_comma_list(p.images) if hasattr(p, 'images') else []
                if not images_list and p.image:
                    images_list = [p.image]
                
                product_data = {
                    # Basic Information
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "category": p.category,
                    "brand": getattr(p, 'brand', ''),
                    "sku": getattr(p, 'sku', ''),
                    "status": getattr(p, 'status', 'active'),
                    
                    # Pricing
                    "price": p.price,
                    "costPrice": getattr(p, 'cost_price', None),
                    "discount": getattr(p, 'discount', None),
                    "taxRate": getattr(p, 'tax_rate', None),
                    
                    # Media
                    "image": p.image,  # Legacy field
                    "images": images_list,  # New field
                    
                    # Variants
                    "colors": parse_comma_list(p.colors),
                    "sizes": parse_comma_list(p.sizes),
                    
                    # Inventory
                    "stock": p.stock,
                    "supplier": p.supplier,
                    "minOrderQuantity": getattr(p, 'min_order_quantity', None),
                    "maxOrderQuantity": getattr(p, 'max_order_quantity', None),
                    
                    # Product Details
                    "weight": getattr(p, 'weight', None),
                    "dimensions": parse_json_field(getattr(p, 'dimensions', None)),
                    "specifications": parse_json_field(getattr(p, 'specifications', None), []),
                    
                    # Marketing
                    "tags": parse_comma_list(getattr(p, 'tags', '')),
                    "featured": getattr(p, 'featured', False),
                    
                    # Policies
                    "warranty": getattr(p, 'warranty', ''),
                    "returnPolicy": getattr(p, 'return_policy', ''),
                    
                    # Shipping
                    "shippingClass": getattr(p, 'shipping_class', ''),
                    
                    # Legacy fields for backward compatibility
                    "rating": p.rating,
                    "reviews_count": p.reviews_count,
                }
                
                data.append(product_data)
            
            return jsonify(data), 200
            
        except Exception as e:
            return {"msg": str(e)}, 500


    @app.route("/admin/product/<int:id>", methods=["PUT"])
    @admin_required
    def update_product(id):
        """
        Update an existing product.
        Supports both legacy and new field structures.
        """
        try:
            data = request.json
            product = Product.query.get(id)
            
            if not product:
                return {"msg": "Product not found"}, 404
            
            # Basic Information
            product.name = data.get("name", product.name)
            product.description = data.get("description", product.description)
            product.category = data.get("category", product.category)
            
            if hasattr(product, 'brand'):
                product.brand = data.get("brand", product.brand)
            if hasattr(product, 'sku'):
                product.sku = data.get("sku", product.sku)
            if hasattr(product, 'status'):
                product.status = data.get("status", product.status)
            
            # Pricing
            product.price = data.get("price", product.price)
            
            if hasattr(product, 'cost_price'):
                product.cost_price = data.get("costPrice", product.cost_price)
            if hasattr(product, 'discount'):
                product.discount = data.get("discount", product.discount)
            if hasattr(product, 'tax_rate'):
                product.tax_rate = data.get("taxRate", product.tax_rate)
            
            # Media - Handle both single and multiple images
            if "images" in data:
                images = data.get("images", [])
                if images and len(images) > 0:
                    product.image = images[0]  # Set primary image
                    if hasattr(product, 'images'):
                        product.images = serialize_comma_list(images)
            elif "image" in data:
                product.image = data.get("image", product.image)
            
            # Variants
            if "colors" in data:
                product.colors = serialize_comma_list(data.get("colors"))
            if "sizes" in data:
                product.sizes = serialize_comma_list(data.get("sizes"))
            
            # Inventory
            product.stock = data.get("stock", product.stock)
            product.supplier = data.get("supplier", product.supplier)
            
            if hasattr(product, 'min_order_quantity'):
                product.min_order_quantity = data.get("minOrderQuantity", product.min_order_quantity)
            if hasattr(product, 'max_order_quantity'):
                product.max_order_quantity = data.get("maxOrderQuantity", product.max_order_quantity)
            
            # Product Details
            if hasattr(product, 'weight'):
                product.weight = data.get("weight", product.weight)
            if hasattr(product, 'dimensions'):
                product.dimensions = serialize_json_field(data.get("dimensions", parse_json_field(product.dimensions)))
            if hasattr(product, 'specifications'):
                product.specifications = serialize_json_field(data.get("specifications", parse_json_field(product.specifications, [])))
            
            # Marketing
            if hasattr(product, 'tags'):
                product.tags = serialize_comma_list(data.get("tags", parse_comma_list(product.tags)))
            if hasattr(product, 'featured'):
                product.featured = data.get("featured", product.featured)
            
            # Policies
            if hasattr(product, 'warranty'):
                product.warranty = data.get("warranty", product.warranty)
            if hasattr(product, 'return_policy'):
                product.return_policy = data.get("returnPolicy", product.return_policy)
            
            # Shipping
            if hasattr(product, 'shipping_class'):
                product.shipping_class = data.get("shippingClass", product.shipping_class)
            
            db.session.commit()
            
            return {"msg": "Product updated successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
        

    @app.route("/admin/product/<int:id>", methods=["DELETE"])
    @admin_required
    def delete_product(id):
        """
        Delete a product.
        Functionality unchanged from original.
        """
        try:
            product = Product.query.get(id)
            
            if not product:
                return {"msg": "Product not found"}, 404
            
            db.session.delete(product)
            db.session.commit()
            
            return {"msg": "Product deleted successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500


    # Additional helpful endpoint for getting a single product
    @app.route("/admin/product/<int:id>", methods=["GET"])
    @admin_required
    def get_admin_product(id):
        """
        Get a single product by ID with full details.
        """
        try:
            p = Product.query.get(id)
            
            if not p:
                return {"msg": "Product not found"}, 404
            
            # Parse images
            images_list = parse_comma_list(p.images) if hasattr(p, 'images') else []
            if not images_list and p.image:
                images_list = [p.image]
            
            product_data = {
                # Basic Information
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "brand": getattr(p, 'brand', ''),
                "sku": getattr(p, 'sku', ''),
                "status": getattr(p, 'status', 'active'),
                
                # Pricing
                "price": p.price,
                "costPrice": getattr(p, 'cost_price', None),
                "discount": getattr(p, 'discount', None),
                "taxRate": getattr(p, 'tax_rate', None),
                
                # Media
                "image": p.image,
                "images": images_list,
                
                # Variants
                "colors": parse_comma_list(p.colors),
                "sizes": parse_comma_list(p.sizes),
                
                # Inventory
                "stock": p.stock,
                "supplier": p.supplier,
                "minOrderQuantity": getattr(p, 'min_order_quantity', None),
                "maxOrderQuantity": getattr(p, 'max_order_quantity', None),
                
                # Product Details
                "weight": getattr(p, 'weight', None),
                "dimensions": parse_json_field(getattr(p, 'dimensions', None)),
                "specifications": parse_json_field(getattr(p, 'specifications', None), []),
                
                # Marketing
                "tags": parse_comma_list(getattr(p, 'tags', '')),
                "featured": getattr(p, 'featured', False),
                
                # Policies
                "warranty": getattr(p, 'warranty', ''),
                "returnPolicy": getattr(p, 'return_policy', ''),
                
                # Shipping
                "shippingClass": getattr(p, 'shipping_class', ''),
                
                # Legacy fields
                "rating": p.rating,
                "reviews_count": p.reviews_count,
            }
            
            return jsonify(product_data), 200
            
        except Exception as e:
            return {"msg": str(e)}, 500
    
    # ================= CART =================

    @app.route("/cart", methods=["POST"])
    @jwt_required()
    def add_cart():
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            product = Product.query.get(data.get("product_id"))
            if not product:
                return {"msg": "Product not found"}, 404
            
            existing_cart = Cart.query.filter_by(
                user_id=user_id,
                product_id=data.get("product_id"),
                color=data.get("color"),
                size=data.get("size")
            ).first()
            
            if existing_cart:
                existing_cart.quantity += data.get("quantity", 1)
            else:
                cart = Cart(
                    user_id=user_id,
                    product_id=data.get("product_id"),
                    quantity=data.get("quantity", 1),
                    color=data.get("color", ""),
                    size=data.get("size", "")
                )
                db.session.add(cart)
            
            db.session.commit()
            
            return {"msg": "Added to cart successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500

    @app.route("/cart", methods=["GET"])
    @jwt_required()
    def get_cart():
        try:
            user_id = int(get_jwt_identity())
            
            carts = Cart.query.filter_by(user_id=user_id).all()
            
            result = []
            total = 0
            
            for c in carts:
                p = Product.query.get(c.product_id)
                item_total = p.price * c.quantity
                total += item_total
                
                result.append({
                    "id": c.id,
                    "product_id": p.id,
                    "name": p.name,
                    "price": p.price,
                    "quantity": c.quantity,
                    "color": c.color,
                    "size": c.size,
                    "image": p.image,
                    "item_total": item_total
                })
            
            return {
                "items": result,
                "total": total,
                "item_count": len(result)
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/cart/<int:id>", methods=["DELETE"])
    @jwt_required()
    def remove_from_cart(id):
        try:
            user_id = int(get_jwt_identity())
            cart = Cart.query.filter_by(id=id, user_id=user_id).first()
            
            if not cart:
                return {"msg": "Cart item not found"}, 404
            
            db.session.delete(cart)
            db.session.commit()
            
            return {"msg": "Item removed from cart"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/cart/<int:id>", methods=["PUT"])
    @jwt_required()
    def update_cart(id):
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            cart = Cart.query.filter_by(id=id, user_id=user_id).first()
            
            if not cart:
                return {"msg": "Cart item not found"}, 404
            
            cart.quantity = data.get("quantity", cart.quantity)
            
            db.session.commit()
            
            return {"msg": "Cart updated"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500

    # ================= ORDER =================

    @app.route("/order", methods=["POST"])
    @jwt_required()
    def create_order():
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            carts = Cart.query.filter_by(user_id=user_id).all()
            
            if not carts:
                return {"msg": "Cart is empty"}, 400
            
            total = 0
            
            for c in carts:
                p = Product.query.get(c.product_id)
                total += p.price * c.quantity
            
            # Apply coupon if provided
            coupon_code = data.get("coupon_code")
            if coupon_code:
                coupon = Coupon.query.filter_by(code=coupon_code).first()
                if coupon:
                    if coupon.discount_type == "percentage":
                        total -= (total * coupon.discount_value / 100)
                    elif coupon.discount_type == "fixed":
                        total -= coupon.discount_value
            
            order = Order(
                user_id=user_id,
                total=total,
                shipping_address=data.get("shipping_address", ""),
                status="confirmed"
            )
            
            db.session.add(order)
            db.session.flush()
            
            order_items_list = []
            for c in carts:
                p = Product.query.get(c.product_id)
                
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=c.product_id,
                    quantity=c.quantity,
                    price=p.price,
                    color=c.color,
                    size=c.size
                )
                
                db.session.add(order_item)
                p.stock -= c.quantity
                order_items_list.append({
                    "name": p.name,
                    "quantity": c.quantity,
                    "price": p.price,
                    "total": p.price * c.quantity
                })
            
            Cart.query.filter_by(user_id=user_id).delete()
            
            db.session.commit()
            
            # Send confirmation email
            user = User.query.get(user_id)
            email_service = EmailService()
            email_service.send_order_confirmation(
                user.email,
                user.name,
                order.id,
                {
                    "items": order_items_list,
                    "total": total,
                    "shipping_address": order.shipping_address
                }
            )
            
            return {
                "msg": "Order created successfully",
                "order_id": order.id,
                "total": total
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/razorpay-order", methods=["POST"])
    @jwt_required()
    def create_razorpay_order():
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            carts = Cart.query.filter_by(user_id=user_id).all()
            
            if not carts:
                return {"msg": "Cart is empty"}, 400
            
            total = 0
            
            for c in carts:
                p = Product.query.get(c.product_id)
                total += p.price * c.quantity
            
            # Apply coupon if provided
            coupon_code = data.get("coupon_code")
            if coupon_code:
                coupon = Coupon.query.filter_by(code=coupon_code).first()
                if coupon:
                    if coupon.discount_type == "percentage":
                        total -= (total * coupon.discount_value / 100)
                    elif coupon.discount_type == "fixed":
                        total -= coupon.discount_value
            
            amount_in_paise = int(total * 100)
            
            order = Order(
                user_id=user_id,
                total=total,
                shipping_address=data.get("shipping_address", ""),
                status="pending"
            )
            
            db.session.add(order)
            db.session.flush()
            
            for c in carts:
                p = Product.query.get(c.product_id)
                
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=c.product_id,
                    quantity=c.quantity,
                    price=p.price,
                    color=c.color,
                    size=c.size
                )
                
                db.session.add(order_item)
            
            db.session.commit()
            
            if 'razorpay_client' in locals():
                razorpay_order = razorpay_client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "receipt": str(order.id),
                    "payment_capture": 1
                })
                
                order.razorpay_order_id = razorpay_order['id']
                db.session.commit()
                
                return {
                    "order_id": order.id,
                    "razorpay_order_id": razorpay_order['id'],
                    "amount": total
                }, 201
            else:
                return {"msg": "Razorpay not configured"}, 500
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/verify-payment", methods=["POST"])
    @jwt_required()
    def verify_payment():
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            order = Order.query.get(data.get("order_id"))
            
            if not order or order.user_id != user_id:
                return {"msg": "Order not found"}, 404
            
            if 'razorpay_client' in locals():
                try:
                    razorpay_client.utility.verify_payment_signature({
                        'razorpay_order_id': data.get("razorpay_order_id"),
                        'razorpay_payment_id': data.get("razorpay_payment_id"),
                        'razorpay_signature': data.get("razorpay_signature")
                    })
                    
                    order.razorpay_payment_id = data.get("razorpay_payment_id")
                    order.status = "confirmed"
                    
                    Cart.query.filter_by(user_id=user_id).delete()
                    
                    order_items_list = []
                    for item in OrderItem.query.filter_by(order_id=order.id).all():
                        product = Product.query.get(item.product_id)
                        product.stock -= item.quantity
                        order_items_list.append({
                            "name": product.name,
                            "quantity": item.quantity,
                            "price": item.price,
                            "total": item.price * item.quantity
                        })
                    
                    db.session.commit()
                    
                    # Send confirmation email
                    user = User.query.get(user_id)
                    email_service = EmailService()
                    email_service.send_order_confirmation(
                        user.email,
                        user.name,
                        order.id,
                        {
                            "items": order_items_list,
                            "total": order.total,
                            "shipping_address": order.shipping_address
                        }
                    )
                    
                    return {"msg": "Payment verified successfully", "order_id": order.id}, 200
                except Exception as e:
                    return {"msg": "Payment verification failed"}, 400
            else:
                return {"msg": "Razorpay not configured"}, 500
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/order/<int:id>", methods=["GET"])
    @jwt_required()
    def get_order(id):
        try:
            user_id = int(get_jwt_identity())
            order = Order.query.get(id)
            
            if not order or order.user_id != user_id:
                return {"msg": "Order not found"}, 404
            
            items = OrderItem.query.filter_by(order_id=id).all()
            
            order_items = []
            for item in items:
                product = Product.query.get(item.product_id)
                order_items.append({
                    "product_id": product.id,
                    "product_name": product.name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "color": item.color,
                    "size": item.size,
                    "image": product.image
                })
            
            return {
                "id": order.id,
                "status": order.status,
                "total": order.total,
                "shipping_address": order.shipping_address,
                "items": order_items,
                "created_at": order.created_at.isoformat(),
                "updated_at": order.updated_at.isoformat()
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/orders", methods=["GET"])
    @jwt_required()
    def get_user_orders():
        try:
            user_id = int(get_jwt_identity())
            
            orders = Order.query.filter_by(user_id=user_id).all()
            
            result = []
            for o in orders:
                items = OrderItem.query.filter_by(order_id=o.id).all()
                result.append({
                    "id": o.id,
                    "total": o.total,
                    "status": o.status,
                    "item_count": len(items),
                    "created_at": o.created_at.isoformat()
                })
            
            return jsonify(result), 200
        except Exception as e:
            return {"msg": str(e)}, 500

    # ================= ADMIN ORDERS =================

    @app.route("/admin/orders", methods=["GET"])
    @admin_required
    def admin_orders():
        try:
            orders = Order.query.all()
            
            data = []
            
            for o in orders:
                user = User.query.get(o.user_id)
                items = OrderItem.query.filter_by(order_id=o.id).all()
                
                data.append({
                    "id": o.id,
                    "user_id": o.user_id,
                    "user_email": user.email if user else "N/A",
                    "total": o.total,
                    "status": o.status,
                    "item_count": len(items),
                    "created_at": o.created_at.isoformat(),
                    "updated_at": o.updated_at.isoformat()
                })
            
            return jsonify(data), 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/admin/order/<int:id>", methods=["PUT"])
    @admin_required
    def update_order_status(id):
        try:
            data = request.json
            
            order = Order.query.get(id)
            
            if not order:
                return {"msg": "Order not found"}, 404
            
            order.status = data.get("status", order.status)
            
            db.session.commit()
            
            return {"msg": "Order updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500

    # ================= REVIEWS =================
    
    @app.route("/review", methods=["POST"])
    @jwt_required()
    def add_review():
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            product = Product.query.get(data.get("product_id"))
            if not product:
                return {"msg": "Product not found"}, 404
            
            review = Review(
                user_id=user_id,
                product_id=data.get("product_id"),
                rating=data.get("rating"),
                comment=data.get("comment", "")
            )
            
            db.session.add(review)
            
            # Update product rating
            all_reviews = Review.query.filter_by(product_id=data.get("product_id")).all()
            total_rating = sum(r.rating for r in all_reviews) + data.get("rating")
            product.rating = total_rating / (len(all_reviews) + 1)
            product.reviews_count = len(all_reviews) + 1
            
            db.session.commit()
            
            return {"msg": "Review added successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    # ================= COUPONS =================
    
    @app.route("/validate-coupon", methods=["POST"])
    @jwt_required()
    def validate_coupon():
        try:
            data = request.json
            
            coupon = Coupon.query.filter_by(code=data.get("code")).first()
            
            if not coupon:
                return {"msg": "Invalid coupon code"}, 404
            
            if coupon.expiry_date and coupon.expiry_date < datetime.utcnow():
                return {"msg": "Coupon has expired"}, 400
            
            return {
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.discount_value
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/admin/coupon", methods=["POST"])
    @admin_required
    def create_coupon():
        try:
            data = request.json
            
            coupon = Coupon(
                code=data.get("code"),
                discount_type=data.get("discount_type"),
                discount_value=data.get("discount_value"),
                expiry_date=data.get("expiry_date"),
                usage_limit=data.get("usage_limit")
            )
            
            db.session.add(coupon)
            db.session.commit()
            
            return {"msg": "Coupon created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/admin/coupons", methods=["GET"])
    @admin_required
    def get_coupons():
        try:
            coupons = Coupon.query.all()
            
            data = []
            for c in coupons:
                data.append({
                    "id": c.id,
                    "code": c.code,
                    "discount_type": c.discount_type,
                    "discount_value": c.discount_value,
                    "expiry_date": c.expiry_date.isoformat() if c.expiry_date else None,
                    "usage_limit": c.usage_limit
                })
            
            return jsonify(data), 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    # ================= USER PROFILE =================
    
    @app.route("/user/profile", methods=["GET"])
    @jwt_required()
    def get_profile():
        try:
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            
            if not user:
                return {"msg": "User not found"}, 404
            
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "address": user.address,
                "is_admin": user.is_admin,
                "created_at": user.created_at.isoformat()
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/user/profile", methods=["PUT"])
    @jwt_required()
    def update_profile():
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            
            user = User.query.get(user_id)
            
            if not user:
                return {"msg": "User not found"}, 404
            
            user.name = data.get("name", user.name)
            user.phone = data.get("phone", user.phone)
            user.address = data.get("address", user.address)
            
            db.session.commit()
            
            return {"msg": "Profile updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    # ================= ORDER HISTORY =================
    
    @app.route("/user/orders", methods=["GET"])
    @jwt_required()
    def get_user_orders():
        try:
            user_id = int(get_jwt_identity())
            
            orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
            
            data = []
            for order in orders:
                items = OrderItem.query.filter_by(order_id=order.id).all()
                items_list = []
                for item in items:
                    product = Product.query.get(item.product_id)
                    items_list.append({
                        "id": item.id,
                        "product_id": item.product_id,
                        "product_name": product.name if product else "Unknown",
                        "product_image": product.image if product else "",
                        "quantity": item.quantity,
                        "price": item.price,
                        "color": item.color,
                        "size": item.size
                    })
                
                data.append({
                    "id": order.id,
                    "total": order.total,
                    "status": order.status,
                    "shipping_address": order.shipping_address,
                    "created_at": order.created_at.isoformat(),
                    "updated_at": order.updated_at.isoformat(),
                    "items": items_list,
                    "item_count": len(items_list)
                })
            
            return jsonify(data), 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/user/order/<int:order_id>", methods=["GET"])
    @jwt_required()
    def get_order_details(order_id):
        try:
            user_id = int(get_jwt_identity())
            
            order = Order.query.get(order_id)
            
            if not order or order.user_id != user_id:
                return {"msg": "Order not found"}, 404
            
            items = OrderItem.query.filter_by(order_id=order_id).all()
            items_list = []
            for item in items:
                product = Product.query.get(item.product_id)
                items_list.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": product.name if product else "Unknown",
                    "product_image": product.image if product else "",
                    "quantity": item.quantity,
                    "price": item.price,
                    "color": item.color,
                    "size": item.size
                })
            
            return {
                "id": order.id,
                "total": order.total,
                "status": order.status,
                "shipping_address": order.shipping_address,
                "created_at": order.created_at.isoformat(),
                "updated_at": order.updated_at.isoformat(),
                "items": items_list
            }, 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    # ================= HEALTH CHECK =================
    
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "OK"}, 200

    # ================= RETURN =================

    return app


# ================= START =================

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
