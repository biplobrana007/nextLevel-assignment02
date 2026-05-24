# 🤖 Next Level Assignment 02



## ✨ Key Features

- User Registration & Login
- JWT Token Authentication
- Protected Routes Middleware
- Role-Based Authorization
- CRUD Operations 
- Optional Sorting Query 
- PostgreSQL Database using Neon DB
- Express Middleware Architecture

---

## 🧩 Tech Stack

Backend
- Node.js
- Express.js
- TypeScript 

Database
- PostgreSQL
- Neon DB

Authentication
- JWT (JSON Web Token)
- bcrypt
Other Tools
- dotenv
- cors
- tsc
---

## 📦 API's

Signup
- POST (https://assignment-02-jet.vercel.app/api/auth/signup)

Login - Created JWT Token
- POST (https://assignment-02-jet.vercel.app/api/auth/login)

Create Issue {Access: Authenticated users (contributor, maintainer)}
- POST (https://assignment-02-jet.vercel.app/api/issues)

Get All Issues (Optional sorting query)
- GET (https://assignment-02-jet.vercel.app/api/issues?sort=newest) -- default
- GET (https://assignment-02-jet.vercel.app/api/issues?sort=oldest)
- GET (https://assignment-02-jet.vercel.app/api/issues?type=bug)
- GET (https://assignment-02-jet.vercel.app/api/issues?type=feature_request)
- GET (https://assignment-02-jet.vercel.app/api/issues?status=open)
- GET (https://assignment-02-jet.vercel.app/api/issues?status=in_progress)
- GET (https://assignment-02-jet.vercel.app/api/issues?status=resolved)

Get Single Issue
- GET (https://assignment-02-jet.vercel.app/api/issues/:id)

Update Issue {Access: Maintainer (any issue) OR Contributor (own issue, only if status is open)}
- PATCH (https://assignment-02-jet.vercel.app/api/issues/:id)

Delete Issue {Access: Maintainer only}
- DELETE (https://assignment-02-jet.vercel.app/api/issues/:id)



---


# Live Link: https://assignment-02-jet.vercel.app/