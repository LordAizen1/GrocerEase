# GrocerEase Design Document
**Course**: Computer Networks (CN) 2025
**Developer**: Md Kaif (2022289), Athiyo Chakma (2022118)

## 1. Project Overview
GrocerEase is a mobile-first grocery delivery application designed to simulate a real-world e-commerce environment. It features a dual-role system (Customer/Shop Owner), real-time inventory management, and geolocation services.

## 2. System Architecture
The application follows a modern hybrid mobile architecture:

*   **Frontend**: Ionic Framework (React)
    *   Provides cross-platform UI components.
    *   Manages Client-Side Routing (React Router).
*   **Native Bridge**: Capacitor
    *   **Geolocation Plugin**: Accesses device GPS for distance calculations.
    *   **Preferences Plugin**: Persists session tokens and cart data natively.
    *   **App Plugin**: Handles hardware lifecycle events (Back Button, App State).
*   **Backend (Simulation)**: Firebase Realtime Database
    *   Acts as a centralized data store for Shops, Users, Items, and Orders.
    *   Simulates "Serverless" behavior.

## 3. Data Model

### 3.1 Users
*   **Role**: `owner` | `customer`
*   **Key**: `uid` (e.g., "owner1")
*   **Metadata**: `email`, `shopId` (if owner).

### 3.2 Shops
*   **Total**: 5 Simulated Shops.
*   **Attributes**: `id`, `name`, `lat`, `lng`, `image`.
*   **Inventory**: Aggregated set of 30 items per shop.

### 3.3 Items
*   **Structure**:
    ```json
    {
      "id": "item_shop1_12",
      "shopId": "shop1",
      "name": "Fresh Apple",
      "price": 12.50,
      "stock": 45,
      "image": "https://..."
    }
    ```
*   **Variety**: Pool of 60+ items (Dairy, Veg, Meat, Bakery) shuffled randomly for each shop.

## 4. Key Algorithms

### 4.1 Atomic Order Processing
To prevent "overselling" (two users buying the last item simultaneously), the app uses a read-verify-write pattern:
1.  **Fetch**: Get latest stock for all items in cart.
2.  **Verify**: Ensure `dbStock >= cartQty` for every item.
3.  **Commit**: If valid, perform a multi-path update to decrement stock and create the order record simultaneously.

### 4.2 Haversine Distance
Distance between Customer and Shop is calculated locally using the Haversine formula:
```javascript
d = 2 * R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlon/2)))
```

## 5. Build and Installation
The project is built as a standard Android APK.

### 5.1 Prerequisites
*   Node.js & npm
*   Android Studio (SDK 29+)
*   Java/Kotlin (JDK 17)

### 5.2 Build Steps
1.  **Install JS Dependencies**: `npm install`
2.  **Build Web Assets**: `npm run build`
3.  **Sync Native Project**: `npx cap sync android`
4.  **Compile APK**:
    ```bash
    cd android
    ./gradlew assembleDebug
    ```
5.  **Output**: `android/app/build/outputs/apk/debug/app-debug.apk`

## 6. User Manual

### 6.1 Customer Mode
1.  **Login**: Choose "Customer" role. Enter any email.
2.  **Browse**: View list of 5 shops. Distance is displayed (requires Location permission).
3.  **Shop**: Tap a shop to view its unique inventory.
4.  **Cart**: Add items. View cart via top-right icon.
5.  **Checkout**: Review total and place order. Stock is deducted instantly.

### 6.2 Shop Owner Mode
1.  **Login**: Choose "Shop Owner" role.
2.  **Credentials**: Use `owner1@example.com` (for Shop 1) through `owner5@example.com`.
3.  **Dashboard**:
    *   **Inventory**: Edit price/stock by taping text. Add items via (+).
    *   **Orders**: View real-time orders placed by customers.
    *   **Reset**: "Reset Demo Data" button restores initial stock and randomizes items.

## 7. Submission Contents
*   `app-debug.apk`: Installer file.
*   `src/`: Full Source Code.
*   `DESIGN_DOCUMENT.md`: This file.
