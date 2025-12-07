# GrocerEase - Mobile Grocery Store App

> **Project Assignment for Computer Networks (CN) 2025**  
> **Developed by:** Md Kaif

A full-featured mobile grocery application built with **Ionic React** and **Capacitor**, featuring a "Blinkit-inspired" modern UI.

## 📋 Assignment Requirements Met
| Requirement | Status | Implementation Details |
| :--- | :--- | :--- |
| **Separate Roles** | ✅ | Dedicated Login for **Customer** and **Shop Owner**. |
| **5 Shop Owners** | ✅ | Database seeds **5 distinct shops** (`owner1` to `owner5`). |
| **30 Items per Shop** | ✅ | Each shop is populated with **30 unique grocery items**. |
| **Item Details** | ✅ | Items have **Image, Name, Price, Stock**, and ID. |
| **>150 Items Demo** | ✅ | System scales to display **150+ items** across shops. |

## Android APK Build
An Android APK is available for testing on physical devices.
*   **Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
*   **Permissions**: The app now requests **Location Permission** to calculate shop distance.
*   **Navigation**: Improved **Back Button** logic — swipe back navigates history; exits only on the home screen.

## 🚀 Key Features
*   **Persistent Login**: App remembers your session (Customer/Owner) even after closing.
*   **Randomized Inventory**: Each shop gets a unique mix of **30 items** from a pool of 60+ (Fruits, Dairy, Snacks, etc.).
*   **Live Inventory**: Stock decreases automatically when customers place orders.
*   **Atomic Transactions**: Simulates real-world locking; prevents overselling.
*   **Owner Dashboard**: Add, Edit, Delete items and **View Orders**.
*   **Smart Cart**: Persistent cart storage; clears automatically on checkout.

## 🛠️ How to Run
**This application is designed to be run as an Android APK.**

1.  **Download/Install APK**:
    *   Locate the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`
    *   Transfer to your Android device and install.
    *   Ensure "Install from Unknown Sources" is enabled.

2.  **Permissions**:
    *   Allow **Location Access** when prompted to enable shop distance calculation.

## 👤 Demo Credentials

### 🛍️ Customer Login
*   **Login**: Toggle to "Customer".
*   **Email**: Enter *any* email (e.g., `user@test.com`).
*   **Action**: Browse shops, add items to cart, place orders.

### 🏪 Shop Owner Login
To view the **Owner Dashboard** and manage inventory:
*   **Login**: Toggle to "Shop Owner".
*   **Email**:
    *   `owner1@example.com` (Manages Shop 1)
    *   `owner2@example.com` (Manages Shop 2)
    *   ... up to `owner5@example.com`.
*   **Tip**: If "Reset Demo Data" is used, each shop will have distinct items.
*   **Action**:
    *   **Edit Price/Stock**: Tap the input box on any item.
    *   **Add Item**: Tap the **+** FAB button.
    *   **Orders Tab**: View incoming orders in real-time.
    *   **Seed Database**: Scroll to bottom and tap **"Reset Demo Data"** to repopulate/shuffle inventory.

## 🎨 Technology Stack
*   **Frontend**: React, Ionic Framework
*   **Native Features**: Capacitor (Geolocation, Preferences, App, Back Button)
*   **State Management**: React Context, Capacitor Preferences
*   **Styling**: CSS Variables (Blinkit Yellow Theme), Google Fonts (Poppins)
*   **Backend**: Firebase Realtime Database
