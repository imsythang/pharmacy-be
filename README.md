<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS Logo" />
</p>

<h1 align="center">Pharmacy Backend</h1>

<p align="center">
  <b>A scalable backend built with NestJS for managing pharmacy operations.</b><br />
  <sub>Crafted with ❤️ by <strong>Hồ Sỹ Thắng</strong> (contact: hothang2004@gmail.com)</sub>
</p>

---

## 🚀 Tech Stack

- ⚙️ **NestJS** - Scalable and maintainable Node.js framework
- 🔐 **OAuth2** (Google & Facebook) - Secure authentication
- 🧠 **JWT + Refresh Tokens** - Stateless session management
- 📦 **Prisma + PostgreSQL** - Modern ORM and reliable database
- 🌐 **Swagger** - Auto-generated API documentation
- 🛡 **Helmet, Rate Limit, Sanitization** - Security best practices

---

## 📁 Project Structure

```bash
src
├── auth           # Login, Register, OAuth2 (Google, Facebook)
├── products       # Medicine & product management
├── orders         # Order placement & tracking
├── articles       # Health news management
├── prisma         # PrismaService
├── common         # Filters, guards, interceptors
├── shared         # Shared modules & helpers
└── main.ts        # App bootstrap
```

---

## 📦 Installation

```bash
git clone https://github.com/imsythang/pharmacy-be.git
cd pharmacy-be
yarn install
```
## Pull lastest code
```bash
git pull origin main
```
### 🧪 Environment Variables

Tạo file `.env`:

```env
DATABASE_URL="postgresql://youruser:yourpass@localhost:5432/pharmacy?schema=public"
JWT_SECRET="your-super-secret"
JWT_EXPIRES_IN="1d"
PORT=3001

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CALLBACK_URL=http://localhost:3001/auth
```

---

## 🧱 Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🛠 Run Locally

```bash
# Dev mode with hot reload
yarn start:dev

# Production
yarn build && yarn start:prod
```

---

## 📖 API Docs (Swagger)

Truy cập [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

## 🔒 Security Checklist

- [x] Helmet (Secure HTTP headers)
- [x] OAuth2 Login (Google & Facebook)
- [x] CSRF-safe (or intentionally skipped for OAuth)
- [x] Rate limiting (Throttler)
- [x] Input sanitization (`sanitize-html`)
- [x] Refresh token with rotation

---

## 📬 Contact

- 👨‍💻 Developer: **Hồ Sỹ Thắng**
- 📧 Email: [hothang2004@gmail.com](mailto:hothang2004@gmail.com)

---

## 🧹 To-Do / Enhancements

- [ ] Add password reset flow
- [ ] Admin dashboard with analytics
- [ ] Add Dockerfile + CI/CD for deployment

---

## 📤 Git Commands (for collaboration)

### 🧑‍💻 If you've cloned before & already committed before

```bash
git pull origin main                 # Pull latest changes
git add .                            # Stage all modified files
git commit -m "..."                  # Add your message
git push origin main                 # Push to remote
```

### 🆕 If this is your first time committing to the repo

```bash
git init                             # Initialize git (if not already)
git remote add origin https://github.com/imsythang/pharmacy-be.git
git checkout -b main                 # Create & switch to 'main' branch
git add .                            # Stage all files
git commit -m "..."                  # First commit message
git push -u origin main              # Push and track remote branch
```

## 📄 License

This project is licensed under the MIT License.

> Made with 💪 by Hồ Sỹ Thắng
