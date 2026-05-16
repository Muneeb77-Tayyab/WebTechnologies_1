# MERN Stack E-commerce Boilerplate (Educational Demo)

This is a comprehensive, production-ready Express.js e-commerce application designed as a demonstration project for students learning the MERN stack. It covers architecture, authentication patterns, administrative controls, and RESTful API design.

## 🚀 Key Features

### 1. Modular MVC Architecture
The project follows a strict Model-View-Controller pattern with segregated folders:
- **Models**: Mongoose schemas for Users, Products, Categories, and Orders.
- **Views**: EJS templates with a common layout and a specialized admin layout.
- **Routes**: Modular route handlers for Auth, Shop, Checkout, and Admin Panel.
- **Middlewares**: Custom logic for authentication, global state management, and file uploads.

### 2. Dual Authentication Patterns
- **Session-Based (EJS)**: Standard cookie-sessions for the web interface.
- **JWT-Based (API)**: Secure JSON Web Tokens for the REST API endpoints, demonstrating modern API security.

### 3. Comprehensive Admin Panel
- **Professional Dashboard**: Summary stats for products, orders, and users.
- **Product Management**: Full CRUD with **Multer file uploads** for product images.
- **Category Management**: Slug-based filtering and CRUD.
- **Order Tracking**: Manage customer orders and update shipping statuses.

### 4. React-Based Headless Admin Panel
A modern, Single Page Application (SPA) built to demonstrate headless architecture:
- **Material UI (MUI)**: Premium UI components and responsive layout.
- **Vite**: High-performance frontend build tool.
- **JWT Auth**: Full integration with the JWT-protected API layer.
- **Client-Side Routing**: Using React Router for seamless navigation.
- **Live Inventory Management**: Real-time product, category, and order tracking.

### 5. Advanced Shop Features
- **Pagination**: Server-side pagination for products and categories.
- **Custom Flash Messaging**: A built-in messaging system without external dependencies.
- **Cookie-Based Cart**: Persistent shopping cart stored in browser cookies.
- **Secure Checkout**: Integration for placing orders with shipping details.

---

## 🛠️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd web-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database**:
   Update `config/default.json` with your MongoDB URI.

4. **Seed Initial Data**:
   This will create an admin user and some test products.
   ```bash
   node seed.js
   ```
   - **Admin Login**: `admin@example.com` / `password123`
   - **User Login**: `user@example.com` / `password123`

5. **Start the Express Server**:
   ```bash
   npm run dev
   ```

6. **Start the React Admin Panel** (Optional):
   In a new terminal:
   ```bash
   cd react-app
   npm install
   npm run dev
   ```
   - **React URL**: `http://localhost:5173/login`
   - **Credentials**: Use the admin account seeded in Step 4.

---

## 📂 Project Structure

```text
web-app/
├── config/             # Configuration files (MongoDB, JWT Secret)
├── middlewares/        # Custom Auth & Global state middlewares
├── models/             # Mongoose Models
├── public/             # Static files (CSS, Uploads, JS)
├── routes/             # Route modules (Web & API)
│   ├── admin/          # Admin CRUD routes
│   ├── api/            # JWT-protected REST APIs
│   ├── auth/           # Login/Register routes
│   └── shop/           # Shop & Cart logic
├── views/              # EJS Templates
│   ├── admin/          # Admin-specific views
│   ├── shop/           # Shop/Cart/Checkout views
│   └── layout.ejs      # Main application layout
├── seed.js             # Database seeding script
└── server.js           # Application entry point
```

---

## 📡 REST API Documentation

The API is protected with **JWT Admin Authentication**. You must first login via the API to get a token.

### 1. Authentication
**POST** `/api/auth`
- **Request Body**:
  ```json
  { "email": "admin@example.com", "password": "password123" }
  ```
- **Response**: `{ "token": "JWT_TOKEN_STRING" }`

### 2. Products
**GET** `/api/products`
- **Response**: Array of product objects with populated category details.

**POST** `/api/products` (Admin Only)
- **Header**: `x-auth-token: <TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Smartphone",
    "description": "Latest model",
    "price": 699,
    "category": "CATEGORY_ID",
    "image": "url_to_image"
  }
  ```
- **Response**: The created product object.

**DELETE** `/api/products/:id` (Admin Only)
- **Header**: `x-auth-token: <TOKEN>`
- **Response**: `{ "msg": "Product removed" }`

### 3. Categories
**GET** `/api/categories`
- **Response**: Array of all category objects.

**POST** `/api/categories` (Admin Only)
- **Header**: `x-auth-token: <TOKEN>`
- **Request Body**: `{ "name": "New Category", "description": "..." }`
- **Response**: The created category object.

### 4. Orders
**GET** `/api/orders` (Admin Only)
- **Header**: `x-auth-token: <TOKEN>`
- **Response**: Array of all customer orders with populated user and product details.

**GET** `/api/orders/:id` (Admin Only)
- **Header**: `x-auth-token: <TOKEN>`
- **Response**: Detailed order object including shipping info and item list.

> [!TIP]
> Use the provided `postman_collection.json` file to test these endpoints!

---

## 🎓 Learning Objectives for Students
1. **Middleware Pipeline**: Understand how `global.js` and `auth.js` intercept requests to inject data or protect routes.
2. **Relational Data**: Observe how `populate()` is used in Mongoose to link Products to Categories and Orders to Users.
3. **Session vs State**: Compare how sessions manage user state in the browser vs how JWT manages state for APIs.
4. **File Handling**: Learn how `multer` processes multipart forms and saves files to the disk.
