# Real-Time Chat Application (Microservices Architecture)

A scalable real-time chat application built using a Node.js/TypeScript microservices architecture, Prisma ORM, PostgreSQL, Socket.IO, and React (Bootstrap).

---

## 🚀 Features

* **Authentication Service:** JWT-based signup & login.
* **User Service:** Profile retrieval, status management, and updating user profiles.
* **Message Service & WebSockets:** Direct 1-on-1 messaging with real-time delivery via Socket.IO.
* **Database:** PostgreSQL managed via Prisma ORM with automated migrations.

---

## 🛠️ Prerequisites

Before starting, ensure you have installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (v14 or higher) running locally or hosted
* [Git](https://git-scm.com/)

---

## ⚙️ Configuration & Environment Variables

1. Clone the repository:
   ```bash
   git clone https://github.com/Pravindu-Bhashitha/Chat-Application.git
   cd Chat-Application

# .env for root folder

POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=chat_app_db

CLOUDINARY_CLOUD_NAME = "qrisbpl5"
CLOUDINARY_API_KEY = "334563368713339"
CLOUDINARY_API_SECRET = "916LASup64kaxf-ZNgx89AZkO40"

JWT_SECRET="H6InPc7CQvR88AV1X4CPPXaQdQA1XCvXS9cSNrAwo9x"

FRONTEND_URL="http://localhost,http://localhost:80,http://localhost:5173"

# .env for web-client

VITE_AUTH_SERVICE_URL=http://localhost/api/auth
VITE_MESSAGE_SERVICE_URL=http://localhost/api/messages
VITE_USER_SERVICE_URL=http://localhost/api/users
VITE_SOCKET_URL = http://localhost

# .env for auth-service

PORT=4001
DATABASE_URL="postgresql://postgres:123456@localhost:5432/chat_app_db?schema=public"
JWT_SECRET="H6InPc7CQvR88AV1X4CPPXaQdQA1XCvXS9cSNrAwo9x"
FRONTEND_URL="http://localhost:5173,http://localhost:"
MESSAGE_SERVICE_URL="http://message_service:4002"

# .env for message-service

PORT=4002
DATABASE_URL="postgresql://postgres:123456@localhost:5432/chat_app_db?schema=public"
JWT_SECRET="H6InPc7CQvR88AV1X4CPPXaQdQA1XCvXS9cSNrAwo9x"
CLIENT_ORIGIN="http://localhost:5173"
CLOUDINARY_CLOUD_NAME = "qrisbpl5"
CLOUDINARY_API_KEY = "334563368713339"
CLOUDINARY_API_SECRET = "916LASup64kaxf-ZNgx89AZkO40"

# .env for user-service

PORT=4003
DATABASE_URL="postgresql://postgres:123456@localhost:5432/chat_app_db?schema=public"
JWT_SECRET="H6InPc7CQvR88AV1X4CPPXaQdQA1XCvXS9cSNrAwo9x"
FRONTEND_URL="http://localhost:5173"
MESSAGE_SERVICE_URL="http://message_service:4002"
