# Post-Booking CRM Application

A comprehensive **Post-Booking Customer Relationship Management** system for real estate projects, built with React + TypeScript + Vite.

## Overview

This application manages the complete post-booking workflow from form submission to agreement generation:

1. **Agents/Users** fill booking forms with scanned documents
2. **Managers** review submissions and verify details
3. **Managers** generate agreements using admin-created templates
4. **Admins** manage projects, templates, and users

## Tech Stack

### Frontend
- **React** 19.2.4 + TypeScript
- **Vite** 8.0.1 (Build tool)
- **React Router** 7.13.2 (Routing)
- **TailwindCSS** 4.2.2 (Styling)
- **Lucide React** 1.7.0 (Icons)

### Backend
- **NestJS** + Fastify
- **Supabase** (PostgreSQL + Auth)
- **Railway** (Deployment)
- **API**: https://pbcrmbackend-production.up.railway.app/api/v1

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin1234 |
| Manager | manager@gmail.com | manager1234 |
| User/Agent | user@gmail.com | user1234 |

## Workflow

### Agent/User Flow
1. Login to system
2. Fill booking form with customer details
3. Upload scanned booking form (PDF/Image)
4. Submit for manager review
5. Track booking status

### Manager Flow
1. View pending bookings with scanned documents
2. Review each field against scanned copy
3. Mark fields as OK/Needs Revision
4. Approve/Reject/Request revision
5. Generate agreement using project template
6. Send agreement to customer

### Admin Flow
1. Create projects with RERA details
2. Create form templates for booking forms
3. Create agreement templates with merge fields
4. Assign managers to projects
5. Monitor system KPIs

## Project Structure

```
src/
├── config/
│   └── api.ts                    # API configuration
├── services/
│   ├── api.ts                    # HTTP client
│   ├── authService.ts            # Authentication
│   ├── bookingService.ts         # Bookings
│   ├── projectService.ts         # Projects
│   ├── documentService.ts        # Documents
│   ├── agreementTemplateService.ts
│   ├── formTemplateService.ts
│   ├── fieldValueService.ts
│   ├── paymentService.ts
│   ├── profileService.ts
│   ├── unitService.ts
│   └── dashboardService.ts
├── context/
│   └── AuthContext.tsx           # Auth state management
├── hooks/
│   └── useDashboard.ts           # Dashboard data hook
├── pages/
│   ├── Login.tsx                 # Login page
│   ├── Dashboard.tsx             # Dashboard
│   ├── BookingForm.tsx           # Booking form
│   ├── MyBookings.tsx            # User bookings
│   ├── NewBookings.tsx           # Manager bookings
│   ├── Agreements.tsx            # Agreements
│   ├── Customers.tsx             # Customers
│   ├── PaymentTracking.tsx       # Payments
│   └── ...
└── components/
    ├── layout/                   # Layout components
    └── ui/                       # UI components
```

## Documentation

- **[POST_BOOKING_WORKFLOW.md](./POST_BOOKING_WORKFLOW.md)** - Complete workflow guide
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Backend integration details
- **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Development roadmap
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Integration summary
- **[BACKEND_API.md](./BACKEND_API.md)** - API documentation

## Features

### ✅ Implemented
- Backend API integration with JWT authentication
- Login with real backend
- Service layer for all modules
- Type-safe interfaces
- Role-based access control

### 🚧 In Progress
- Dynamic booking form with document upload
- Manager review interface
- Agreement generation

### 📋 Planned
- Real-time notifications
- PDF generation
- Payment gateway integration
- Advanced analytics

## API Services

All backend communication is handled through dedicated service modules:

- **apiService** - Core HTTP client with authentication
- **authService** - Login, logout, token management
- **projectService** - Project CRUD operations
- **bookingService** - Booking workflows
- **documentService** - Document upload/download
- **agreementTemplateService** - Agreement templates
- **formTemplateService** - Dynamic form templates
- **fieldValueService** - Form field values
- **paymentService** - Payment tracking
- **profileService** - User profiles
- **unitService** - Unit management
- **dashboardService** - KPIs and analytics

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Environment
The application connects to the production backend:
```
API_BASE_URL=https://pbcrmbackend-production.up.railway.app/api/v1
```

### Scripts
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## License

Proprietary - All rights reserved
