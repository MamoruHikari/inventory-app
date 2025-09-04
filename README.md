# Inventory App

A full-stack inventory management web application built with **Next.js 15**, **Prisma**, **Supabase**, **TypeScript**, and **shadcn/ui**.
This project was developed as part of an internship program.

## ✨ Features Implemented

* **Authentication** (Supabase)
* **Inventory Management**

  * Create inventories with configurable custom fields (string, number, boolean)
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
  * 🌙 **Day/Night Mode** → Automatically switches with OS theme (system dark/light mode support)

## 🚧 Work in Progress

* **Item Detail Page** (`/inventory/[id]/item/[itemId]`)

  * Frontend UI for viewing, editing, and deleting items is created
  * Backend API routes (`GET`, `PUT`, `DELETE`) for items need to be finalized
* **Comments/Discussion System** (planned but not implemented)
* **Bulk operations, search/filtering, and CSV import/export** (planned but not implemented)

## 🛠️ Tech Stack

* [Next.js 15 (App Router, Turbopack)](https://nextjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Prisma ORM](https://www.prisma.io/)
* [Supabase (Auth + PostgreSQL)](https://supabase.com/)
* [shadcn/ui](https://ui.shadcn.com/) for UI components + theme handling
* [Lucide React](https://lucide.dev/) for icons
* **System Theme Detection** for automatic dark/light mode switching
