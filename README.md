# 🍽️ QuickServe - QR-based ordering for restaurants 

QuickServe is a restaurant management system where customers can place orders by scanning a QR code. Hotel owners can manage their menu, tables, and payment options through an easy-to-use dashboard.

## 🌐 Live Demo

- **Frontend (Vercel):** [QuickServe Frontend](https://quick-serve-weld.vercel.app/)
- **Backend (Render):** [QuickServe API](https://quickserve-7.onrender.com/)

## 📌 Features

- User Authentication (Signup, Signin)
- QR Code-based Order Placement
- Menu & Table Management
- Payment QR Code Upload
- Light/Dark Theme Toggle
- Responsive Design

## 🛠️ Tech Stack

### Frontend
- React (TypeScript)
- React Router
- Bootstrap (for styling)
- Vercel (Deployment)

### Backend
- Express (TypeScript)
- PostgreSQL (Database)
- Render (Deployment)

## 📋 Routes

### Public Routes
- `/` - Home Page
- `/signup` - Register a new account
- `/signin` - Login to your account
- `/menu/:hotelId/:table_no` - Place an order for a specific table

### Protected Routes (After Signin)
- `/dashboard` - Admin Dashboard
- `/menu` - Manage Menu Items
- `/tables` - Manage Table Details
- `/orders/:table_no` - View Orders for a Specific Table
- `/payment` - Upload Payment QR Code

## 🚀 Setup Instructions

### Prerequisites
Ensure you have the following installed:

- Node.js (v20+)
- PostgreSQL (running in Docker or local)

### 1. Clone the Repository

```bash
git clone https://github.com/nitesh-0/QuickServe.git
cd quickserve
```

### 2. Backend Setup

```bash
cd apps/backend
npm install
cp .env.example .env
# Update environment variables
npm run dev
```

### 3. Frontend Setup

```bash
cd apps/frontend
npm install
npm run dev
```



