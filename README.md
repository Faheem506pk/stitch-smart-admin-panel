# StitchSmart - Tailor Shop Management System

![StitchSmart Logo](https://res.cloudinary.com/dajdqqwkw/image/upload/v1714307056/stitch-smart-logo_rvbfzs.png)

## Overview

StitchSmart is a comprehensive tailor shop management system designed to streamline operations for tailoring businesses in Pakistan. The application helps manage customers, orders, measurements, employees, and payments in one integrated platform.

## Features

### User Management
- **Role-based Access Control**: Admin and employee roles with customizable permissions
- **Firebase Authentication**: Secure email authentication for all users
- **User Profile Management**: Users can update their profiles and change passwords
- **Permission Management**: Admins can assign specific permissions to employees

### Customer Management
- **Customer Database**: Store and manage customer information
- **Search Functionality**: Quickly find customers by name, phone, or email
- **Customer Details**: View comprehensive customer information and order history
- **WhatsApp Integration**: Contact customers directly via WhatsApp

### Order Management
- **Order Tracking**: Create and track orders from creation to delivery
- **Order Details**: Comprehensive view of order information, items, and status
- **Payment Tracking**: Monitor advance payments and remaining balances
- **Due Date Management**: Track upcoming deliveries and overdue orders

### Measurement Management
- **Custom Measurement Templates**: Create and use measurement templates
- **Customer Measurements**: Store and retrieve customer measurements
- **Measurement History**: Track changes to customer measurements over time

### Financial Management
- **Pakistani Rupee (Rs) Currency**: All financial transactions in PKR
- **Integer-only Amounts**: No decimal or negative values for simpler accounting
- **Payment Recording**: Track partial and full payments
- **Payment History**: View complete payment history for each order

### Reporting and Analytics
- **Dashboard**: Overview of business performance
- **Sales Reports**: Track revenue and outstanding payments
- **Order Status**: Monitor pending, in-progress, and completed orders

### Settings and Configuration
- **Business Settings**: Configure shop information and preferences
- **Firebase Integration**: Connect to your Firebase project
- **Cloudinary Integration**: Image upload and management

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Authentication, Firestore)
- **Storage**: Cloudinary for image storage
- **State Management**: Zustand
- **Routing**: React Router
- **Build Tool**: Vite

## Screenshots

### Dashboard
![Dashboard](https://res.cloudinary.com/dajdqqwkw/image/upload/v1714307056/stitch-smart-dashboard_rvbfzs.png)

### Customer Management
![Customers](https://res.cloudinary.com/dajdqqwkw/image/upload/v1714307056/stitch-smart-customers_rvbfzs.png)

### Order Management
![Orders](https://res.cloudinary.com/dajdqqwkw/image/upload/v1714307056/stitch-smart-orders_rvbfzs.png)

### User Profile
![Profile](https://res.cloudinary.com/dajdqqwkw/image/upload/v1714307056/stitch-smart-profile_rvbfzs.png)

## Installation and Setup

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd stitch-smart-admin-panel

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Add your Firebase configuration to the app:
   - Go to Settings > Firebase Settings
   - Enter your Firebase project details

## Cloudinary Configuration

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name and API Key
3. Configure in the app:
   - Go to Settings > Cloudinary Settings
   - Enter your Cloudinary credentials

## License

This project is licensed under the MIT License - see the LICENSE file for details.
