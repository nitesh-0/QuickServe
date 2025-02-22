# 🍽️ QuickServe - QR-based ordering for restaurants 

![QuickServe](https://your-image-link.com) _(Add an image of your app here)_

---

## 📌 About QuickServe  
**QuickServe** is a **restaurant management system** that enables **customers to scan a QR code** at their table, view the **menu**, and **place orders seamlessly**.  
Hotel owners can **manage menus, track orders, and process payments effortlessly**.  

### ✨ Features  
- 📲 **QR Code-based Ordering**  
- 🍽️ **Menu Management**  
- 🏷️ **Table Management**  
- 🔄 **Order Tracking & Status Updates**  
- 💳 **Payment Integration (QR Code-based)**  
- 👥 **Role-based Access (Admin, Customer, Staff)**  
- 🌗 **Dark/Light Theme Support**  

---

## Api endpoints
Endpoint	                              Method	Description
/api/v1/auth/signup	                      POST	Register a new user
/api/v1/auth/login	                      POST	User login
/api/v1/menu/:hotelId	                  GET	Get menu for a hotel
/api/v1/place-order	                      POST	Place an order
/api/v1/table-orders/:hotelId/:table_no	  GET	Get orders for a table

## 🛠️ Tech Stack  
### **Frontend (React + TypeScript)**  
- ⚛️ **React.js** (Component-based UI)  
- 🔗 **React Router** (Navigation)  
- 🎨 **Bootstrap** (Styling & Responsiveness)  

### **Backend (Express + PostgreSQL)**  
- 🚀 **Node.js + Express.js** (RESTful API)  
- 🗄️ **PostgreSQL** (Database)  
- 🏗️ **TypeScript** (Strongly typed backend)  

---

## 🚀 Getting Started  

### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/your-username/quickserve.git  
cd quickserve  
