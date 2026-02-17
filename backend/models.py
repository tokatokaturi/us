from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    last_cart_check_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Product(db.Model):
    __tablename__ = "product"  # KEEP EXISTING TABLE NAME

    id = db.Column(db.Integer, primary_key=True)

    # Basic Info
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default="")
    category = db.Column(db.String(100), default="")
    brand = db.Column(db.String(100), default="")
    # Multiple categories: women, men, studio, new, unisex
    is_women = db.Column(db.Boolean, default=False)
    is_men = db.Column(db.Boolean, default=False)
    is_studio = db.Column(db.Boolean, default=False)
    is_new = db.Column(db.Boolean, default=False)
    is_unisex = db.Column(db.Boolean, default=False)
    sku = db.Column(db.String(100), unique=True, index=True)
    status = db.Column(db.String(50), default="active")

    # Pricing
    price = db.Column(db.Float, nullable=False)
    cost_price = db.Column(db.Float)
    discount = db.Column(db.Float)
    tax_rate = db.Column(db.Float)

    # Media
    image = db.Column(db.String(500), default="")
    images = db.Column(db.Text, default="")

    # Variants
    colors = db.Column(db.String(500), default="")
    sizes = db.Column(db.String(500), default="")

    # Inventory
    stock = db.Column(db.Integer, default=0)
    supplier = db.Column(db.String(255), default="")
    min_order_quantity = db.Column(db.Integer, default=1)
    max_order_quantity = db.Column(db.Integer)

    # Physical
    weight = db.Column(db.Float)
    dimensions = db.Column(db.Text, default="{}")

    # Details
    specifications = db.Column(db.Text, default="[]")
    tags = db.Column(db.String(500), default="")
    featured = db.Column(db.Boolean, default=False)

    # Customer Service
    warranty = db.Column(db.Text, default="")
    return_policy = db.Column(db.Text, default="")
    shipping_class = db.Column(db.String(100), default="")

    # Reviews
    rating = db.Column(db.Float, default=0.0)
    reviews_count = db.Column(db.Integer, default=0)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "brand": self.brand,
            "sku": self.sku,
            "status": self.status,
            "price": self.price,
            "cost_price": self.cost_price,
            "discount": self.discount,
            "tax_rate": self.tax_rate,
            "image": self.image,
            "images": self.images,
            "colors": self.colors.split(",") if self.colors else [],
            "sizes": self.sizes.split(",") if self.sizes else [],
            "stock": self.stock,
            "supplier": self.supplier,
            "min_order_quantity": self.min_order_quantity,
            "max_order_quantity": self.max_order_quantity,
            "weight": self.weight,
            "dimensions": self.dimensions,
            "specifications": self.specifications,
            "tags": self.tags.split(",") if self.tags else [],
            "featured": self.featured,
            "warranty": self.warranty,
            "return_policy": self.return_policy,
            "shipping_class": self.shipping_class,
            "rating": self.rating,
            "reviews_count": self.reviews_count,
        }

    @property
    def final_price(self):
        if self.discount:
            return self.price * (1 - self.discount / 100)
        return self.price


class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    color = db.Column(db.String(50))
    size = db.Column(db.String(50))
    email_sent = db.Column(db.Boolean, default=False)
    email_sent_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Wishlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="pending")
    shipping_address = db.Column(db.Text, nullable=True)
    razorpay_order_id = db.Column(db.String(200), nullable=True)
    razorpay_payment_id = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(50))
    size = db.Column(db.String(50))


class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Coupon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_type = db.Column(db.String(20))
    discount_value = db.Column(db.Float)
    expiry_date = db.Column(db.DateTime)
    usage_limit = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

