# Inventory Management System

A comprehensive inventory management application built with **Next.js 15**, **TypeScript**, **Supabase**, and **Prisma ORM**, featuring advanced integrations with **Salesforce CRM** and **Microsoft Power Automate**.

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

#### Microsoft Power Automate Integration  
- **OneDrive Integration** - Upload support tickets as JSON files
- **Automated Workflows** - Trigger email notifications and mobile alerts
- **Help Desk System** - Create support tickets from any page

## Technical Architecture

### Frontend Stack
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** + **Shadcn/ui** component library
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend & Database
- **Next.js API Routes** for server-side logic
- **Supabase** for database and authentication
- **Prisma ORM** for type-safe database operations
- **PostgreSQL** with real-time subscriptions
- **OAuth 2.0** for third-party integrations

## Database Schema

### Core Models

#### User Model
- UUID-based primary key with Supabase Auth integration
- Profile data (name, avatar, role) with default "user" role
- One-to-many relationships with inventories, items, comments, and likes

#### Category Model
- Predefined categories for inventory classification with optimized name-based lookups

#### Inventory Model (Templates)
- Core fields: title, description, image, tags, and public visibility
- Custom ID system: configurable prefix, format, and counter for item numbering
- Dynamic fields: up to 3 configurable fields each for strings, numbers, and booleans
- Built-in version control and relationships with users, categories, items, and comments

#### Item Model
- Actual inventory entries based on templates
- Unique custom ID per inventory with dynamic data storage
- Individual version control and user relationships

#### Engagement Models
- **Comments**: User comments on inventories with timestamps
- **Likes**: User likes on items with unique constraints

## Integration Workflows

### Salesforce CRM Workflow
1. OAuth authentication with secure token storage in httpOnly cookies
2. User fills export form with company/contact details
3. API creates Account and Contact records in Salesforce
4. Success confirmation with Salesforce record IDs

### Power Automate Workflow
1. Support ticket form collects issue details from any page
2. JSON file generated and uploaded to OneDrive via Microsoft Graph API
3. Power Automate flow triggers email and mobile notifications

## Security Features

- **Authentication Required** - All routes protected with Supabase Auth
- **Type-safe Operations** - Prisma prevents SQL injection attacks
- **Secure Token Storage** - HTTPS cookies with automatic OAuth refresh
- **Input Validation** - Server-side data validation and sanitization
- **Environment Security** - Sensitive data stored securely with CORS protection

## API Endpoints

### Authentication
- `GET /api/auth/salesforce` - Initiate Salesforce OAuth
- `GET /api/auth/salesforce/callback` - Handle OAuth callback
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth  
- `GET /api/auth/microsoft/callback` - Handle OAuth callback

### Integrations
- `POST /api/salesforce/create-account` - Export data to Salesforce CRM
- `POST /api/power-automate/upload-ticket` - Upload support tickets to OneDrive

## Deployment

**Production URL**: https://inventory-app-7p7n.onrender.com

Deployed on **Render** with:
- Automatic GitHub deployments
- Production PostgreSQL with Prisma connection pooling
- Automatic database migrations
- Configured Salesforce Connected App and Microsoft App Registration
- Power Automate flows for file monitoring and notifications

## Business Value

This application demonstrates enterprise-level integration patterns for modern business environments:

- **CRM Integration** - Seamless data export to sales teams
- **Workflow Automation** - Reduced manual processes with automated notifications  
- **Multi-platform Support** - Integration with popular business tools
- **Type-Safe Development** - Reliable database operations with Prisma ORM
- **Scalable Architecture** - Built to handle growing data and user loads
- **Enterprise Security** - Production-grade security and data protection

Perfect for businesses looking to streamline inventory management while maintaining integration with existing business tools and workflows.
