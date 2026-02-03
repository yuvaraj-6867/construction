# Construction Management System

A complete full-stack construction management application with React TypeScript frontend and Ruby on Rails API backend.

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Run the Application

```bash
cd /home/yuvaraj/construction

# Start all services (Database + Backend + Frontend)
 docker compose up --build -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: PostgreSQL on localhost:5432

### Stop the Application

```bash
docker-compose down
```

---

## 🔑 Login Credentials

After starting with Docker, login with any of these accounts:

| Role | Email | Phone | Password |
|------|-------|-------|----------|
| **Admin** | admin@construction.com | 9876543210 | Admin@123 |
| **Manager** | manager@construction.com | 9876543212 | Manager@123 |
| **Supervisor** | supervisor@construction.com | 9876543211 | Super@123 |
| **Accountant** | accountant@construction.com | 9876543213 | Account@123 |
| **Viewer** | viewer@construction.com | 9876543214 | Viewer@123 |

**Note:** You can login with either email OR phone number.

---

## 🛠️ Manual Setup (Without Docker)

### Prerequisites
- Node.js 16+ and npm
- Ruby 3.4.4
- PostgreSQL 15+
- Bundler gem

### Environment Setup

1. **Copy the environment file:**
```bash
cp .env.example .env
```

2. **Edit `.env` file if needed:**
```bash
# Update database credentials, API URLs, etc.
nano .env
```

The `.env` file at the project root contains all environment variables for both frontend and backend:
- Database configuration (PostgreSQL)
- Backend settings (Rails, Secret Key)
- Frontend settings (API URL)

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: http://localhost:3000

### Backend Setup

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3001
```

Backend API runs at: http://localhost:3001

---

## 📁 Project Structure

```
construction/
├── frontend/              # React + TypeScript
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React Context (Auth, Language)
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # Global styles
│   ├── Dockerfile
│   └── package.json
│
├── backend/              # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/  # API controllers
│   │   ├── models/       # Database models
│   │   └── concerns/     # Reusable modules
│   ├── db/
│   │   ├── migrate/      # Database migrations
│   │   └── seeds.rb      # Seed data
│   ├── Dockerfile
│   └── Gemfile
│
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

---

## ✨ Features

### Core Modules
- 🏗️ **Projects** - Manage construction projects
- 👷 **Workers** - Worker management and tracking
- 📊 **Attendance** - Daily attendance with wage calculation
- 💰 **Payments** - Track worker payments and advances
- 🧱 **Materials** - Material purchase tracking
- 💵 **Expenses** - Project expense management
- 💳 **Client Advances** - Client payment tracking
- 🧾 **Invoices** - Invoice generation
- 📸 **Site Photos** - Project photo gallery

### Technical Features
- 🔐 **JWT Authentication** - Secure token-based auth
- 👥 **Role-Based Access Control** - 5 user roles with permissions
- 🌐 **Bilingual Support** - English & Tamil languages
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔑 **Flexible Login** - Login with email OR phone number
- 🔒 **Password Validation** - Strong password requirements
- 📄 **PDF Export** - Generate PDF reports
- 📊 **Excel Export** - Export data to Excel

---

## 🛠️ Technology Stack

### Frontend
- **React** 19.2.3
- **TypeScript** 4.9.5
- **React Router** 7.1.1
- **Context API** - State management
- **Google Fonts** - Noto Sans Tamil for Tamil support

### Backend
- **Ruby on Rails** 7.2.3
- **Ruby** 3.4.4
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User management
- Role assignment
- All CRUD operations

### Manager
- Project management
- Worker management
- Financial operations (view, create, edit)
- Cannot delete or manage users

### Supervisor
- Worker management
- Attendance marking
- Material requests
- View-only for financials

### Accountant
- Financial operations (payments, expenses, invoices)
- View-only for projects and workers

### Viewer
- Read-only access to all modules
- No create/edit/delete permissions

---

## 🐳 Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Run Commands in Containers

```bash
# Rails console
docker-compose exec backend rails console

# Database reset
docker-compose exec backend rails db:reset

# Run migrations
docker-compose exec backend rails db:migrate

# Install npm packages
docker-compose exec frontend npm install
```

### Access Container Shell

```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec db psql -U yuvaraj -d construction_api_development
```

---

## 🔧 Development

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend Development

```bash
cd backend

# Install gems
bundle install

# Create database
rails db:create

# Run migrations
rails db:migrate

# Seed database
rails db:seed

# Start server
rails server -p 3001

# Rails console
rails console

# View routes
rails routes
```

---

## 📊 Database Schema

### Main Tables

- **users** - User accounts with roles
- **projects** - Construction projects
- **workers** - Project workers
- **attendances** - Daily worker attendance
- **payments** - Worker payments
- **materials** - Material purchases
- **expenses** - Project expenses
- **client_advances** - Client payments
- **invoices** - Generated invoices
- **site_photos** - Project photos

---

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (@$!%*?&#)

### Authentication
- JWT token-based authentication
- Tokens stored in localStorage
- Protected routes
- Role-based authorization

---

## 🌐 API Endpoints

### Authentication
```
POST /api/v1/auth/login       # Login (email or phone)
POST /api/v1/auth/register    # Register new user
GET  /api/v1/auth/me          # Get current user
```

### Projects
```
GET    /api/v1/projects       # List all projects
POST   /api/v1/projects       # Create project
GET    /api/v1/projects/:id   # Get project details
PATCH  /api/v1/projects/:id   # Update project
DELETE /api/v1/projects/:id   # Delete project
```

*Similar endpoints available for workers, attendance, payments, materials, expenses, client_advances, invoices, and site_photos.*

---

## 🐛 Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Kill process
kill -9 <PID>
```

**Database connection error:**
```bash
# Restart database
docker-compose restart db

# Check database health
docker-compose exec db pg_isready -U yuvaraj
```

**Frontend not loading:**
```bash
# Clear and reinstall
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install
docker-compose restart frontend
```

### Local Development Issues

**Frontend:**
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Backend:**
```bash
# Reset database
rails db:drop db:create db:migrate db:seed

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

---

## 📝 Environment Variables

### Backend (.env)
```
POSTGRES_HOST=db
POSTGRES_USER=yuvaraj
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
RAILS_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

---

## 🚢 Deployment

### Docker Deployment
The application is Docker-ready and can be deployed to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

### Traditional Deployment

**Frontend:**
- Vercel
- Netlify
- Firebase Hosting

**Backend:**
- Heroku
- Railway
- AWS EC2
- DigitalOcean

---

## 📞 Support & Maintenance

### Common Tasks

**Add new user role:**
1. Update `backend/app/models/concerns/role_permissions.rb`
2. Update `frontend/src/utils/permissions.ts`
3. Run migrations if needed

**Add new module:**
1. Create model and migration in backend
2. Create controller and routes
3. Add permissions to role_permissions
4. Create frontend components
5. Update navigation

**Update translations:**
1. Edit `frontend/src/contexts/LanguageContext.tsx`
2. Add translation keys for both English and Tamil

---

## 📜 License

Proprietary - All rights reserved

---

## 🎯 Project Status

✅ **Authentication** - Complete with JWT and role-based access
✅ **Database** - PostgreSQL setup with migrations and seeds
✅ **User Roles** - 5 roles with granular permissions
✅ **Login System** - Email/Phone login with password validation
✅ **Bilingual Support** - English and Tamil languages
✅ **Docker Setup** - Complete containerization
✅ **Password Security** - Strong password requirements

---

**Made with ❤️ for Construction Management**

**Version:** 1.0.0
**Last Updated:** January 2026
