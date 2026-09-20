# Expense Tracker – MongoDB

A full-stack Expense Tracker application built using Node.js, Express.js, MongoDB and Mongoose. The application allows users to securely manage expenses, automatically categorize expenses using Gemini AI, purchase premium membership through Cashfree, view a premium leaderboard, and reset forgotten passwords through email.

## Features

- User Signup and Login
- Password hashing using bcrypt
- JWT-based authentication
- Add expenses
- View all personal expenses
- Delete expenses
- Automatic expense categorization using Gemini AI
- Premium membership using Cashfree
- Premium status verification
- Premium leaderboard
- Forgot password functionality
- Password reset through email
- Transaction-based expense and user updates
- MongoDB database using Mongoose

## Tech Stack

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- Mongoose

### Database

- MongoDB Atlas

### Authentication & Security

- JWT
- bcrypt
- dotenv

### AI

- Google Gemini API

### Payment

- Cashfree Payment Gateway

### Email

- Brevo / Sendinblue

## Project Structure

````text
expense-tracker-mongodb/
│
├── backend/
│   ├── controllers/
│   │   ├── expenseController.js
│   │   ├── leaderboardController.js
│   │   ├── passwordController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Order.js
│   │   └── ForgotPasswordRequest.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   └── passwordRoutes.js
│   │
│   ├── services/
│   │   └── aiService.js
│   │
│   ├── utils/
│   │   └── database.js
│   │
│   ├── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── expense.html
│   ├── expense.js
│   ├── login.html
│   ├── login.js
│   ├── signup.html
│   ├── signup.js
│   ├── reset-password.html
│   ├── reset-password.js
│   └── style.css
│
├── .gitignore
├── package.json
└── README.md

MongoDB Implementation

The project uses MongoDB Atlas with Mongoose.

Main collections:

users
expenses
orders
forgotpasswordrequests

Mongoose schemas are used to define the structure and validation rules for each collection.

MongoDB ObjectIds are used to identify documents and reference users from expenses and orders.

Authentication

Passwords are hashed using bcrypt before storing them in MongoDB.

After successful login, the backend generates a JWT containing the user's ID.

Protected routes use authentication middleware to verify the JWT and identify the logged-in user.

Expense Management

Users can:

Add expenses
View their expenses
Delete their expenses

When an expense is added, Gemini AI categorizes the expense based on its description.

The user's totalExpense is also updated.

MongoDB transactions are used when an expense and the user's total expense need to be updated together.

AI Expense Categorization

Google Gemini AI is used to automatically categorize expenses.

For example:

Description: "Bought groceries from supermarket"
Category: Food

The AI categorization logic is implemented in:

backend/services/aiService.js
Premium Membership

Cashfree is integrated for premium membership purchases.

Premium users can access the leaderboard.

The payment flow includes:

Create Cashfree order
Store order in MongoDB
Complete payment
Verify payment
Update user premium status
Display premium features
Leaderboard

Premium users can view the leaderboard.

Users are sorted based on their total expenses.

The leaderboard endpoint retrieves users from MongoDB and returns their name and total expense.

Forgot Password

The forgot-password flow:

User enters their email
Backend finds the user
A unique reset request ID is generated
Reset request is stored in MongoDB
Reset link is sent through Brevo
User opens the reset page
New password is hashed using bcrypt
Password is updated in MongoDB
Reset request is marked inactive
Environment Variables

Create a .env file inside the backend directory.

Example:

PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret
SENDINBLUE_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_sender_email
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://127.0.0.1:5500/frontend

Never commit .env to GitHub.

Installation

Clone the repository:

git clone https://github.com/Sachin-Hipparge/expense-tracker-mongodb.git

Go to the backend:

cd expense-tracker-mongodb/backend

Install dependencies:

npm install

Create the .env file and add the required environment variables.

Start the backend:

npm start

The backend runs on:

http://localhost:3000
Frontend

Open the frontend using a local development server such as VS Code Live Server.

The frontend communicates with the backend running on port 3000.

API Routes
User
POST /user/signup
POST /user/login
GET  /user/premium-status
Expense
POST   /expense/add
GET    /expense/all
DELETE /expense/delete/:id
Payment
GET /purchase/purchase-premium
GET /purchase/verify-payment/:orderId
Leaderboard
GET /leaderboard
Password
POST /password/forgotpassword
GET  /password/resetpassword/:id
POST /password/resetpassword/:id
Database Migration

This version of the project uses MongoDB and Mongoose.

The previous version used MySQL/Sequelize. The MongoDB version replaces the previous relational database layer with MongoDB collections and Mongoose models while maintaining the application's main functionality.

Author

Sachin Hipparge


---

# 2. Important README correction

In the README above, the `.env` is shown only as an **example configuration**. Do **not** actually create or commit a real `.env` from the README.

Your real `.env` remains local.

---

# 3. Commit the README

From the project root:

```powershell
git add README.md
````
