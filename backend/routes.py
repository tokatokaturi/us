# Additional routes for wishlist and cart abandonment
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Wishlist, Product, User, Cart
from email_service import EmailService
from datetime import datetime, timedelta


def register_additional_routes(app):
    """Register wishlist and cart abandonment routes"""
    
    email_service = EmailService()
    
    # ================= WISHLIST ROUTES =================
    
    @app.route("/wishlist", methods=["GET"])
    @jwt_required()
    def get_wishlist():
        """Get user's wishlist"""
        try:
            user_id = int(get_jwt_identity())
            wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()
            
            items = []
            for item in wishlist_items:
                product = Product.query.get(item.product_id)
                if product:
                    items.append({
                        "id": product.id,
                        "name": product.name,
                        "description": product.description,
                        "price": product.price,
                        "image": product.image,
                        "category": product.category,
                        "discount": product.discount,
                        "added_at": item.created_at.isoformat()
                    })
            
            return jsonify(items), 200
        except Exception as e:
            return {"msg": str(e)}, 500
    
    @app.route("/wishlist", methods=["POST"])
    @jwt_required()
    def add_to_wishlist():
        """Add product to wishlist"""
        try:
            user_id = int(get_jwt_identity())
            data = request.json
            product_id = data.get("product_id")
            
            if not product_id:
                return {"msg": "Product ID is required"}, 400
            
            # Check if product exists
            product = Product.query.get(product_id)
            if not product:
                return {"msg": "Product not found"}, 404
            
            # Check if already in wishlist
            existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
            if existing:
                return {"msg": "Product already in wishlist"}, 400
            
            # Add to wishlist
            wishlist_item = Wishlist(user_id=user_id, product_id=product_id)
            db.session.add(wishlist_item)
            db.session.commit()
            
            return {"msg": "Added to wishlist"}, 201
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/wishlist/<int:product_id>", methods=["DELETE"])
    @jwt_required()
    def remove_from_wishlist(product_id):
        """Remove product from wishlist"""
        try:
            user_id = int(get_jwt_identity())
            
            wishlist_item = Wishlist.query.filter_by(
                user_id=user_id, 
                product_id=product_id
            ).first()
            
            if not wishlist_item:
                return {"msg": "Item not in wishlist"}, 404
            
            db.session.delete(wishlist_item)
            db.session.commit()
            
            return {"msg": "Removed from wishlist"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    # ================= CART ABANDONMENT EMAIL ROUTES =================
    
    @app.route("/send-cart-abandonment-email", methods=["POST"])
    @jwt_required()
    def send_cart_abandonment_email():
        """Send cart abandonment email to user"""
        try:
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            
            if not user:
                return {"msg": "User not found"}, 404
            
            # Get user's cart items
            cart_items = Cart.query.filter_by(user_id=user_id).all()
            
            if not cart_items:
                return {"msg": "Cart is empty"}, 400
            
            # Prepare items for email
            items_for_email = []
            total = 0
            
            for item in cart_items:
                product = Product.query.get(item.product_id)
                if product:
                    item_total = product.price * item.quantity
                    total += item_total
                    
                    items_for_email.append({
                        "name": product.name,
                        "quantity": item.quantity,
                        "price": product.price,
                        "total": item_total,
                        "color": item.color,
                        "size": item.size
                    })
            
            # Send email
            email_service.send_cart_abandonment(
                user.email,
                user.name,
                items_for_email,
                total
            )
            
            # Mark email as sent
            for item in cart_items:
                item.email_sent = True
                item.email_sent_at = datetime.utcnow()
            
            db.session.commit()
            
            return {"msg": "Cart abandonment email sent"}, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
    
    @app.route("/cart-abandonment-check", methods=["GET"])
    def check_cart_abandonment():
        """Periodic job to check for abandoned carts and send emails"""
        try:
            # Find carts that haven't been checked in the last 24 hours
            time_threshold = datetime.utcnow() - timedelta(hours=24)
            
            users_with_carts = db.session.query(User.id).distinct().join(
                Cart, User.id == Cart.user_id
            ).filter(
                (User.last_cart_check_at.is_(None)) | (User.last_cart_check_at < time_threshold)
            ).all()
            
            sent_count = 0
            
            for (user_id,) in users_with_carts:
                user = User.query.get(user_id)
                cart_items = Cart.query.filter_by(user_id=user_id).all()
                
                if cart_items and not cart_items[0].email_sent:
                    # Prepare items
                    items_for_email = []
                    total = 0
                    
                    for item in cart_items:
                        product = Product.query.get(item.product_id)
                        if product:
                            item_total = product.price * item.quantity
                            total += item_total
                            
                            items_for_email.append({
                                "name": product.name,
                                "quantity": item.quantity,
                                "price": product.price,
                                "total": item_total,
                                "color": item.color,
                                "size": item.size
                            })
                    
                    # Send email
                    email_service.send_cart_abandonment(
                        user.email,
                        user.name,
                        items_for_email,
                        total
                    )
                    
                    # Mark as sent
                    for item in cart_items:
                        item.email_sent = True
                        item.email_sent_at = datetime.utcnow()
                    
                    user.last_cart_check_at = datetime.utcnow()
                    sent_count += 1
            
            db.session.commit()
            
            return {
                "msg": "Cart abandonment check completed",
                "emails_sent": sent_count
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"msg": str(e)}, 500
