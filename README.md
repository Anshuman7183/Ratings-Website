 Roxiler Coding Challenge — Rating Website

## 📌 Overview
This project is a **Full-Stack Rating Platform** built for the Roxiler Systems coding challenge.  
The goal was to design both backend APIs and a small frontend to demonstrate how users can register, login, create stores, and give ratings to those stores.

It allows different roles (**Admin, Store Owner, User**) to interact with stores and ratings.

- Admin → Manage users & stores, view dashboard stats  
- Store Owner → View ratings on their store, average rating, and list of users who rated  
- Normal User → Search stores, give ratings, update ratings  


🚀Tech Stack:
Backend: Node.js, Express, Prisma, PostgreSQL
Frontend: React, Vite, Tailwind CSS
Validation: express-validator
Other: dotenv, cors


📂Project Structure:
backend/   → Express + Prisma API
frontend/  → React + Vite client

⚙️Setup Instructions:
1. Clone the repo:
git clone https://github.com/Anshuman7183/Ratings-Website.git
cd Ratings-Website

2. Backend setup:
cd backend
npm install


# Copy .env.example to .env and fill in your own values (DB, PORT, JWT secret).
3. Generate Prisma client:
npx prisma generate


4. Run database migrations:
npx prisma migrate dev


5. Start backend:
npm run dev

# By default, backend runs on http://localhost:4000

6. Frontend setup:
cd ../frontend
npm install
npm run dev

# By default, frontend runs on http://localhost:5173

🔑Features Implemented:
User registration & login
Simple auth (token-based)
Create and list stores
Rate stores (1–5 stars)
View stores and their average ratings
Pagination on stores list
Separate Admin endpoints (toggle store, list users)

📸Demo:
Landing: Shows stores, ratings, and top-rated stores
Auth: Register new users or login with existing credentials

Demo Credentials:
Admin
Email: admin@example.com
Password: password123

Owner
Email: owner@example.com
Password: password123

User
Email: user@example.com
Password: password123

Author
Made by Anshuman Anand Nayak

Ratings: Users can rate a store, and ratings update the average

Admin: Can list users and toggle store active status
