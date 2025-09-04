# Inventory App

A full-stack inventory management web application built with **Next.js 15**, **Prisma**, **Supabase**, **TypeScript**, and **shadcn/ui**.
This project was developed as part of an internship program.

## Live Demo

You can try the app here: [Inventory App Live](https://inventory-app-7p7n.onrender.com)

## ✨ Features Implemented

* **Authentication** (Supabase)
* **Inventory Management**

  * Create and edit inventories with configurable custom fields (string, number, boolean)
  * Public/private inventories with access control
  * View inventory details
* **Item Management**

  * Add items to inventories via modal form
  * Dynamic form fields based on inventory configuration
  * Items are stored with generated custom IDs per inventory
  * Items list renders on inventory detail page
* **Database Integration**

  * Prisma ORM connected to Supabase PostgreSQL
  * Models for `User`, `Inventory`, `Item`, `Category`, and `Comment`
  * Verified item creation in Prisma Studio
* **UI/UX**

  * Modern design using [shadcn/ui](https://ui.shadcn.com/)
  * Dialog, form, input, checkbox, and button components integrated
  * Responsive inventory and item detail pages
  * Day/Night Mode → Automatically switches with OS theme (system dark/light mode support)

## 🛠️ Tech Stack

* [Next.js 15 (App Router, Turbopack)](https://nextjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Prisma ORM](https://www.prisma.io/)
* [Supabase (Auth + PostgreSQL)](https://supabase.com/)
* [shadcn/ui](https://ui.shadcn.com/) for UI components + theme handling
* [Lucide React](https://lucide.dev/) for icons
