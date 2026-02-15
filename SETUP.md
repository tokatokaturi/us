# Enterprise E-Commerce Platform - Setup Guide

This is a full-stack enterprise e-commerce website with Flask backend, React frontend, Google OAuth, Razorpay integration, and admin panel.

## Features

✅ **User Authentication**
- Email/Password Login & Signup
- Google OAuth 2.0 Integration
- JWT Token-based Auth
- Secure Password Hashing (bcrypt)

✅ **Product Management**
- Browse Products with Filters
- Search & Category Support
- Product Reviews & Ratings
- Inventory Management (Admin)

✅ **Shopping Cart**
- Add/Remove Items
- Update Quantities
- Real-time Cart Updates
- Persistent Cart

✅ **Orders & Payments**
- Razorpay Payment Integration
- Order History
- Order Tracking
- Order Status Management (Admin)

✅ **Admin Dashboard**
- Protected Admin Panel
- Add/Edit/Delete Products
- View All Orders
- Manage Inventory
- Create Coupons

✅ **Dark Theme**
- Black background with amber accents
- Professional UI with Shadcn/ui components
- Mobile Responsive

## Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Git

## Backend Setup (Flask)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create .env File
```bash
# backend/.env
JWT_SECRET_KEY=your-secret-key-change-this
DATABASE_URI=sqlite:///database.db
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
GOOGLE_CLIENT_ID=your-google-client-id
```

### 5. Initialize Database
```bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
>>>     db.create_all()
>>> exit()
```

### 6. Run Flask Server
```bash
python app.py
```
Server runs on `http://localhost:5000`

## Frontend Setup (React + Vite)

### 1. Navigate to Project Root
```bash
cd ..
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Create .env File
```bash
# .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-public-key
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Setup Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add `http://localhost:5173` to authorized origins
6. Copy Client ID to `.env`

### 5. Setup Razorpay
1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings > API Keys
3. Copy Key ID and Key Secret to backend `.env`
4. Copy Key ID to frontend `.env` as REACT_APP_RAZORPAY_KEY_ID

### 6. Run Development Server
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## Default Admin Credentials

Admin login is based on user role in database. To create an admin:

1. Register a user normally
2. In backend database, update the user's `is_admin` field to `True`:
```python
python
>>> from app import create_app, db
>>> from models import User
>>> app = create_app()
>>> with app.app_context():
>>>     user = User.query.filter_by(email='your@email.com').first()
>>>     user.is_admin = True
>>>     db.commit()
>>> exit()
```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /google-login` - Google OAuth login
- `POST /verify-token` - Verify JWT token

### Products
- `GET /products` - Get all products (with filters)
- `GET /product/:id` - Get product details
- `POST /admin/product` - Add product (admin only)
- `PUT /admin/product/:id` - Update product (admin only)
- `DELETE /admin/product/:id` - Delete product (admin only)
- `GET /admin/products` - Get all products (admin view)

### Cart
- `POST /cart` - Add to cart
- `GET /cart` - Get cart items
- `PUT /cart/:id` - Update cart item quantity
- `DELETE /cart/:id` - Remove from cart

### Orders
- `POST /order` - Create order
- `GET /orders` - Get user orders
- `GET /order/:id` - Get order details
- `GET /admin/orders` - Get all orders (admin only)
- `PUT /admin/order/:id` - Update order status (admin only)

### Payments
- `POST /razorpay-order` - Create Razorpay order
- `POST /verify-payment` - Verify payment

### Reviews
- `POST /review` - Add product review

### Coupons
- `POST /validate-coupon` - Validate coupon code
- `POST /admin/coupon` - Create coupon (admin only)
- `GET /admin/coupons` - Get all coupons (admin only)

## Project Structure

```
ecomwebsite/
├── backend/
│   ├── app.py              # Flask app with all routes
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   └── database.db         # SQLite database
├── src/
│   ├── pages/
│   │   ├── Login.tsx       # Login with Google OAuth
│   │   ├── Signup.tsx      # Signup page
│   │   ├── Products.tsx    # Products listing
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx        # Shopping cart
│   │   ├── Checkout.tsx    # Checkout with Razorpay
│   │   ├── OrderHistory.tsx
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── AddProduct.tsx
│   │       ├── Inventory.tsx
│   │       └── Orders.tsx
│   ├── components/
│   │   ├── Header.tsx      # Navigation header
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/             # Shadcn UI components
│   ├── context/
│   │   └── AuthContext.tsx # Auth state management
│   ├── App.tsx             # Main app routes
│   ├── index.css           # Dark theme styles
│   └── main.tsx
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

## Deployment

### Deploy Backend (Flask)
- Use Heroku, Railway, or AWS
- Set environment variables on hosting platform
- Update API URL in frontend `.env`

### Deploy Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static host
- Update API URL before building

## Security Features

✅ JWT Authentication with expiry
✅ Password hashing with bcrypt
✅ Admin role-based access control
✅ Protected admin routes
✅ CORS configured for security
✅ Input validation on backend
✅ SQL injection protection with parameterized queries
✅ Razorpay payment verification

## Troubleshooting

### Backend won't start
```bash
# Clear SQLAlchemy cache
rm -rf backend/__pycache__
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't load
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### CORS errors
- Ensure Flask-CORS is installed
- Check `CORS(app)` in backend/app.py

### Google OAuth not working
- Verify Client ID in `.env`
- Check authorized origins in Google Console
- Clear browser cookies

### Razorpay payment fails
- Verify Key ID and Key Secret in `.env`
- Check Razorpay integration in checkout page
- Test with Razorpay test keys first

## Support & Contact

For issues or questions, please open an issue on GitHub or contact support.

---

**Built with ❤️ using Flask, React, and Razorpay**
