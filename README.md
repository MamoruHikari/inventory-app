# Inventory Management System

A comprehensive inventory management application built with **Next.js 14**, **TypeScript**, **Supabase**, and **Prisma ORM**, featuring advanced integrations with **Salesforce CRM** and **Microsoft Power Automate**.

## Overview

This full-stack web application provides users with powerful inventory management capabilities while offering seamless integration with popular business tools. The system supports user authentication, dynamic form creation, inventory tracking, and automated workflows.

## Key Features

### 🏠 Core Application
- **User Authentication** - Secure login/registration with Supabase Auth
- **Dynamic Form Builder** - Create custom inventory forms with various field types
- **Inventory Management** - Add, edit, delete, and track inventory items
- **Template System** - Reusable form templates for different inventory categories  
- **Search & Filtering** - Advanced search capabilities across inventory data
- **Responsive Design** - Mobile-friendly interface with dark/light theme support

### 🔗 Business Integrations

#### Salesforce CRM Integration
- **OAuth Authentication** - Secure connection to user's Salesforce org
- **Account & Contact Creation** - Export inventory data to Salesforce
- **Real-time Data Sync** - Push inventory information to CRM
- **Session Management** - Automatic token refresh and error handling

#### Microsoft Power Automate Integration  
- **OneDrive Integration** - Upload support tickets as JSON files
- **Automated Workflows** - Trigger email notifications and mobile alerts
- **Help Desk System** - Create support tickets from any page
- **Cloud Flow Processing** - Automatic file processing and notifications

## Technical Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for server-side logic
- **Supabase** for database and authentication
- **Prisma ORM** for type-safe database operations
- **PostgreSQL** database with real-time subscriptions
- **OAuth 2.0** for third-party integrations

### Database & ORM
- **Prisma Client** for database queries and mutations
- **Type-safe database operations** with auto-generated TypeScript types
- **Database migrations** managed through Prisma Migrate
- **Schema-first approach** with `schema.prisma` definitions

### Integrations
- **Salesforce REST API** for CRM functionality
- **Microsoft Graph API** for OneDrive access
- **Power Automate** for workflow automation
- **Axios** for HTTP requests

## Database Schema

### Users Table
- User authentication and profile information
- Linked to Supabase Auth users
- Managed through Prisma User model

### Templates Table  
- Custom form templates created by users
- JSON schema for dynamic form generation
- Prisma Template model with relations

### Items Table
- Inventory items with dynamic data structure
- Foreign key relationship to templates
- Prisma Item model with type safety

### User Access Control
- Row-level security (RLS) policies in Supabase
- Template sharing permissions
- Admin user management through Prisma queries

## Integration Workflows

### Salesforce CRM Workflow
1. User clicks "Connect to Salesforce" in profile
2. OAuth redirect to Salesforce login
3. Token exchange and secure storage in httpOnly cookies  
4. User fills export form with company/contact details
5. API creates Account and Contact records in Salesforce
6. Success confirmation with Salesforce record IDs

### Power Automate Workflow
1. User clicks "Help" button from any page
2. Support ticket form collects issue details and priority
3. JSON file generated with ticket metadata
4. File uploaded to OneDrive via Microsoft Graph API
5. Power Automate flow triggered on file creation
6. Email notifications sent to admins
7. Mobile push notification delivered

## Security Features

- **Authentication Required** - All routes protected with Supabase Auth
- **Type-safe Database Operations** - Prisma prevents SQL injection attacks
- **HTTPS Cookie Security** - Secure token storage for production
- **CORS Protection** - Proper cross-origin request handling
- **Environment Variables** - Sensitive data stored securely
- **Token Refresh** - Automatic OAuth token renewal
- **Input Validation** - Server-side data validation and sanitization

## API Endpoints

### Authentication
- `GET /api/auth/salesforce` - Initiate Salesforce OAuth
- `GET /api/auth/salesforce/callback` - Handle OAuth callback
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth  
- `GET /api/auth/microsoft/callback` - Handle OAuth callback

### Salesforce Integration
- `POST /api/salesforce/create-account` - Export data to Salesforce CRM

### Power Automate Integration
- `POST /api/power-automate/upload-ticket` - Upload support tickets to OneDrive

## Deployment

The application is deployed on **Render** with automatic deployments from the GitHub repository. Environment variables are configured in the Render dashboard for secure credential management.

### Production URL
- **Live Application**: https://inventory-app-7p7n.onrender.com

### Database Configuration
- **Prisma Client** configured for production PostgreSQL
- **Connection pooling** via Supabase pooler
- **Database migrations** applied automatically on deployment

### Third-Party Configurations
- **Salesforce Connected App** configured with production callback URLs
- **Microsoft App Registration** set up with proper redirect URIs
- **Power Automate Flows** configured for file monitoring and notifications

## Business Value

This application demonstrates enterprise-level integration patterns commonly used in modern business environments:

- **CRM Integration** - Seamlessly export customer data to sales teams
- **Workflow Automation** - Reduce manual processes with automated notifications  
- **Multi-platform Support** - Connect with popular business tools
- **Type-Safe Development** - Prisma ORM ensures reliable database operations
- **Scalable Architecture** - Built to handle growing data and user loads
- **Security First** - Enterprise-grade security and data protection

Perfect for businesses looking to streamline inventory management while maintaining integration with their existing business tools and workflows, with the added reliability and developer experience benefits of Prisma ORM.
