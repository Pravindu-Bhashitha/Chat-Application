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
   npm install
   ```

2. Create a `.env` file in each location below. Replace the `<placeholder>` values with your own — **never commit real secrets**; `.env` files are git-ignored.

**Root folder** (`.env`)
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your_db_password>
POSTGRES_DB=chat_app_db

CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

JWT_SECRET=<a_long_random_string>

FRONTEND_URL="http://localhost,http://localhost:80,http://localhost:5173"
```

**`packages/web-client/.env`**
```env
VITE_AUTH_SERVICE_URL=http://localhost:4001/api/auth
VITE_MESSAGE_SERVICE_URL=http://localhost:4002/api/messages
VITE_USER_SERVICE_URL=http://localhost:4003/api/users
VITE_SOCKET_URL=http://localhost:4002
```

**`packages/auth-service/.env`**
```env
PORT=4001
DATABASE_URL="postgresql://postgres:<your_db_password>@localhost:5432/chat_app_db?schema=public"
JWT_SECRET=<same_jwt_secret_as_above>
FRONTEND_URL="http://localhost:5173"
MESSAGE_SERVICE_URL="http://localhost:4002"
```

**`packages/message-service/.env`**
```env
PORT=4002
DATABASE_URL="postgresql://postgres:<your_db_password>@localhost:5432/chat_app_db?schema=public"
JWT_SECRET=<same_jwt_secret_as_above>
CLIENT_ORIGIN="http://localhost:5173"
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

**`packages/user-service/.env`**
```env
PORT=4003
DATABASE_URL="postgresql://postgres:<your_db_password>@localhost:5432/chat_app_db?schema=public"
JWT_SECRET=<same_jwt_secret_as_above>
FRONTEND_URL="http://localhost:5173"
MESSAGE_SERVICE_URL="http://localhost:4002"
```

---

## ☁️ Deployment

* **Database:** PostgreSQL on [Neon](https://neon.tech).
* **Backend services:** [Render](https://render.com) via the `render.yaml` Blueprint (auth, message and user services). Migrations run automatically when the message service starts.
* **Frontend:** [Vercel](https://vercel.com) with root directory `packages/web-client` and the `VITE_*` variables pointing at the Render URLs.
