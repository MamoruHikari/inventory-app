# Inventory Management System ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-1.0-00bfff?logo=supabase) ![Prisma](https://img.shields.io/badge/Prisma-4.15-blue?logo=prisma)

A full-featured **inventory management application** with **Salesforce CRM** and **Microsoft Power Automate** integrations, built with modern **Next.js 15**, **TypeScript**, **Supabase**, and **Prisma ORM**.

[Live Demo](https://inventory-app-7p7n.onrender.com)

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Technical Architecture](#technical-architecture)
* [Database Schema](#database-schema)
* [Integration Workflows](#integration-workflows)
* [Security](#security)
* [API Endpoints](#api-endpoints)
* [Deployment](#deployment)
* [Business Value](#business-value)

---

## Overview

This system offers **end-to-end inventory management**:

* User authentication and role-based access
* Dynamic form creation for inventory templates
* Real-time inventory tracking
* Automated workflows with CRM and help desk tools

Ideal for businesses that want **seamless integration** with existing platforms while maintaining type-safe, scalable development.

---

## Key Features

<details>
<summary>Core Application</summary>

* **User Authentication** – Supabase-powered secure login/registration
* **Dynamic Form Builder** – Text, number, and boolean field support
* **Inventory Management** – CRUD operations on items and templates
* **Template System** – Reusable inventory templates
* **Search & Filtering** – Advanced queries across inventories and items
* **Responsive UI** – Mobile-friendly, light/dark themes

</details>

<details>
<summary>Salesforce CRM Integration</summary>

* **OAuth Authentication** – Secure connection to Salesforce accounts
* **Data Export** – Create Accounts and Contacts from inventory
* **Real-time Sync** – Push updates to CRM automatically
* **Session Management** – Automatic token refresh and error handling

</details>

<details>
<summary>Microsoft Power Automate</summary>

* **OneDrive Integration** – Upload support tickets as JSON files
* **Automated Workflows** – Trigger email and mobile notifications
* **Help Desk Support** – Create tickets from any page
* **Cloud Flow Processing** – Automatic file handling

</details>

---

## Technical Architecture

<details>
<summary>Frontend</summary>

* **Next.js 15** with App Router
* **TypeScript** for type safety
* **Tailwind CSS** for styling
* **Shadcn/ui** component library
* **React Hook Form** for forms
* **Lucide React** for icons

</details>

<details>
<summary>Backend</summary>

* **Next.js API Routes** for server logic
* **Supabase** for authentication and database
* **Prisma ORM** with PostgreSQL
* **OAuth 2.0** for third-party integrations

</details>

<details>
<summary>Integrations & APIs</summary>

* **Salesforce REST API** – CRM
* **Microsoft Graph API** – OneDrive
* **Power Automate** – Workflow automation
* **Axios** – HTTP requests

</details>

---

## Database Schema

<details>
<summary>Core Models</summary>

* **User** – UUID, profile info, inventories, items, comments, likes
* **Category** – Inventory categories, indexed by name
* **Inventory (Template)** – Title, description, image, tags, dynamic fields, versioning
* **Item** – Based on templates, custom ID, dynamic data, versioning
* **Engagement** – Comments and likes with unique constraints

</details>

---

## Integration Workflows

<details>
<summary>Salesforce CRM Workflow</summary>

1. Connect via "Connect to Salesforce" button
2. OAuth login & secure token storage
3. Fill export form
4. API creates Salesforce Account & Contact
5. Confirmation with record IDs

</details>

<details>
<summary>Power Automate Workflow</summary>

1. Click "Help" button
2. Fill support ticket form (issue, priority)
3. JSON ticket uploaded to OneDrive
4. Power Automate flow triggered
5. Admin email and mobile notifications sent

</details>

---

## Security

* Supabase Auth protects routes
* Prisma prevents SQL injection via type-safe queries
* HTTPS cookies & secure environment variables
* CORS configured
* OAuth token refresh & server-side validation

---

## API Endpoints

<details>
<summary>Authentication</summary>

* `GET /api/auth/salesforce` – Initiate Salesforce OAuth
* `GET /api/auth/salesforce/callback` – OAuth callback
* `GET /api/auth/microsoft` – Initiate Microsoft OAuth
* `GET /api/auth/microsoft/callback` – OAuth callback

</details>

<details>
<summary>Salesforce & Power Automate</summary>

* `POST /api/salesforce/create-account` – Export inventory to Salesforce
* `POST /api/power-automate/upload-ticket` – Upload support tickets

</details>

---

## Deployment

* **Platform:** Render with GitHub CI/CD
* **Database:** PostgreSQL with Prisma migrations and connection pooling
* **Third-Party Apps:** Salesforce Connected App, Microsoft App Registration, Power Automate flows
* **Production URL:** [https://inventory-app-7p7n.onrender.com](https://inventory-app-7p7n.onrender.com)

---

## Business Value

* CRM integration for sales teams
* Workflow automation to reduce manual work
* Multi-platform connectivity
* Type-safe, scalable architecture
* Enterprise-grade security
