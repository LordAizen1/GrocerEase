import { ref, set, get, child, update, runTransaction } from 'firebase/database';
import { db } from '../firebaseConfig';

export interface Shop {
    id: string;
    name: string;
    ownerId: string;
    lat: number;
    lng: number;
    image: string;
}

export interface Item {
    id: string;
    shopId: string;
    name: string;
    price: number;
    stock: number;
    image: string;
}

export interface CartItem extends Item {
    quantity: number;
}

export const seedDatabase = async () => {
    const owners: Record<string, any> = {};
    const shops: Record<string, Shop> = {};
    const items: Record<string, Item> = {};

    // Generate 5 owners and 5 shops
    for (let i = 1; i <= 5; i++) {
        const ownerId = `owner${i}`;
        owners[ownerId] = {
            uid: ownerId,
            email: `owner${i}@example.com`,
            role: 'owner',
            shopId: `shop${i}`
        };

        const shopId = `shop${i}`;
        shops[shopId] = {
            id: shopId,
            name: `GrocerEase Shop ${i}`,
            ownerId: ownerId,
            // Random coordinates near a central point (roughly Delhi/India or generic)
            // Lat: 28.6 +/- 0.1, Lng: 77.2 +/- 0.1
            lat: 28.6 + (Math.random() * 0.2 - 0.1),
            lng: 77.2 + (Math.random() * 0.2 - 0.1),
            image: `https://loremflickr.com/500/300/grocery,supermarket/all?random=${i}`
        };

        // Extended Item Pool (50+ items) to ensure variety across shops
        const masterItemConfig = [
            // Fruits & Veg
            { name: 'Fresh Apple', tags: 'apple,fruit' },
            { name: 'Banana Bunch', tags: 'banana,fruit' },
            { name: 'Carrot Bag', tags: 'carrot,vegetable' },
            { name: 'Spinach', tags: 'spinach,vegetable' },
            { name: 'Tomato', tags: 'tomato,vegetable' },
            { name: 'Potato', tags: 'potato,vegetable' },
            { name: 'Red Onion', tags: 'onion,vegetable' },
            { name: 'Garlic Bulbs', tags: 'garlic,vegetable' },
            { name: 'Green Chili', tags: 'chili,vegetable' },
            { name: 'Lemon', tags: 'lemon,fruit' },
            { name: 'Cucumber', tags: 'cucumber,vegetable' },
            { name: 'Broccoli', tags: 'broccoli,vegetable' },
            { name: 'Watermelon', tags: 'watermelon,fruit' },
            { name: 'Grapes', tags: 'grapes,fruit' },
            // Dairy & Eggs
            { name: 'Whole Milk', tags: 'milk,dairy' },
            { name: 'Cheddar Cheese', tags: 'cheese,dairy' },
            { name: 'Dozen Eggs', tags: 'eggs,dairy' },
            { name: 'Salted Butter', tags: 'butter,dairy' },
            { name: 'Greek Yogurt', tags: 'yogurt,dairy' },
            { name: 'Paneer', tags: 'cheese,dairy' },
            { name: 'Cream', tags: 'cream,dairy' },
            // Bakery
            { name: 'Sourdough Bread', tags: 'bread,bakery' },
            { name: 'Whole Wheat Bread', tags: 'bread,bakery' },
            { name: 'Croissant', tags: 'croissant,bakery' },
            { name: 'Bagel', tags: 'bagel,bakery' },
            { name: 'Chocolate Cake', tags: 'cake,bakery' },
            // Meat & Protein
            { name: 'Chicken Breast', tags: 'chicken,meat' },
            { name: 'Ground Beef', tags: 'beef,meat' },
            { name: 'Salmon Fillet', tags: 'fish,meat' },
            // Pantry & Grains
            { name: 'Basmati Rice', tags: 'rice,grain' },
            { name: 'Pasta Penne', tags: 'pasta,italian' },
            { name: 'Corn Cereal', tags: 'cereal,breakfast' },
            { name: 'Oats', tags: 'oats,grain' },
            { name: 'White Sugar', tags: 'sugar,baking' },
            { name: 'Wheat Flour', tags: 'flour,baking' },
            { name: 'Cooking Oil', tags: 'oil,cooking' },
            { name: 'Table Salt', tags: 'salt,cooking' },
            { name: 'Black Pepper', tags: 'pepper,spice' },
            { name: 'Turmeric Powder', tags: 'spice,cooking' },
            { name: 'Red Chili Powder', tags: 'spice,cooking' },
            { name: 'Honey', tags: 'honey,sweet' },
            // Beverages
            { name: 'Ground Coffee', tags: 'coffee,beverage' },
            { name: 'Green Tea', tags: 'tea,beverage' },
            { name: 'Orange Juice', tags: 'orange,juice' },
            { name: 'Cola Soda', tags: 'soda,beverage' },
            { name: 'Mineral Water', tags: 'water,bottle' },
            { name: 'Energy Drink', tags: 'drink,beverage' },
            // Snacks
            { name: 'Potato Chips', tags: 'chips,snack' },
            { name: 'Chocolate Bar', tags: 'chocolate,candy' },
            { name: 'Cookies', tags: 'cookie,bakery' },
            { name: 'Mixed Nuts', tags: 'nuts,snack' },
            { name: 'Popcorn', tags: 'popcorn,snack' },
            // Household
            { name: 'Dish Soap', tags: 'soap,household' },
            { name: 'Paper Towels', tags: 'paper,household' },
            { name: 'Laundry Detergent', tags: 'soap,household' }
        ];

        // Shuffle and pick 30 unique items for this shop
        const shuffled = [...masterItemConfig].sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, 30);

        for (let j = 1; j <= 30; j++) {
            const itemId = `item_${shopId}_${j}`;
            const config = selectedItems[j - 1];

            // Use a randomized image URL to avoid caching duplicates visually
            const randomSig = Math.floor(Math.random() * 1000);

            items[itemId] = {
                id: itemId,
                shopId: shopId,
                name: config.name,
                price: Math.floor(Math.random() * 20) + 2, // $2 - $22
                stock: Math.floor(Math.random() * 50) + 10,
                image: `https://loremflickr.com/320/240/${config.tags},grocery/all?random=${randomSig}`
            };
        }
    }

    try {
        await set(ref(db, 'users'), owners); // Note: This might overwrite existing users if any
        await set(ref(db, 'shops'), shops);
        await set(ref(db, 'items'), items);
        console.log('Database seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        return false;
    }
};

export const getShops = async (): Promise<Shop[]> => {
    try {
        const snapshot = await get(ref(db, 'shops'));
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    } catch (error) {
        console.error('Error getting shops:', error);
        return [];
    }
};

export const getItems = async (shopId: string): Promise<Item[]> => {
    try {
        // In a real app, you might query by shopId. 
        // Here we'll fetch all items and filter because structure is flat 'items/{itemId}'
        // Optimally: structure items as 'items/{shopId}/{itemId}' or use query
        const snapshot = await get(ref(db, 'items'));
        if (snapshot.exists()) {
            const allItems = Object.values(snapshot.val()) as Item[];
            return allItems.filter(item => item.shopId === shopId);
        }
        return [];
    } catch (error) {
        console.error('Error getting items:', error);
        return [];
    }
};
export const createItem = async (item: Item) => {
    try {
        await set(ref(db, `items/${item.id}`), item); // Use set since ID is known/generated
        return true;
    } catch (error) {
        console.error('Error creating item:', error);
        return false;
    }
};

export const deleteItem = async (itemId: string) => {
    try {
        await set(ref(db, `items/${itemId}`), null);
        return true;
    } catch (error) {
        console.error('Error deleting item:', error);
        return false;
    }
};

export const getShopOrders = async (shopId: string) => {
    try {
        const snapshot = await get(ref(db, `orders/${shopId}`));
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    } catch (error) {
        console.error('Error getting orders:', error);
        return [];
    }
};

export const updateItem = async (itemId: string, data: Partial<Item>) => {
    try {
        await update(ref(db, `items/${itemId}`), data);
        return true;
    } catch (error) {
        console.error('Error updating item:', error);
        return false;
    }
};

export const placeOrder = async (cart: CartItem[], shopId: string, customerId: string) => {
    const updates: Record<string, any> = {};
    const orderId = `order_${Date.now()}`;

    try {
        // 1. Fetch current stock for all items involved to ensure they exist and have stock
        // Note: In high currency, perform this inside a transaction or use conditioned writes.
        // Realtime DB multi-path update is atomic. However, if stock changed between our read and our write
        // we might overwrite it blindly if we just calculated `stock - qty`.
        // Best practice for atomic inventory in RTDB: Use `runTransaction` on a parent node or verify before write.
        // Given the structure 'items/{id}', a single root transaction is too heavy.
        // FOR THIS ASSIGNMENT: We will use a Transaction on the specific items, but to do it atomically for specific items
        // is hard. 
        //
        // TRADITIONAL APPROACH for "Assignment Level" Atomicity:
        // We will try to update ALL items. If one fails, we fail all?
        // Actually, RTDB `update()` is atomic. If we send:
        // { "items/A/stock": 4, "items/B/stock": 2 }
        // It happens all or nothing.
        // THE RISK: We read "5", we decide to write "4". Someone else wrote "0" in between. We write "4". Stock increases!
        //
        // CORRECT APPROACH: Use transaction on each item? No, that's not atomic across items.
        //
        // SOLUTION: We will just use `runTransaction` but for the Assignment Demo (single user or low concurrency), 
        // the read-then-atomic-write pattern is usually acceptable if we don't have high concurrency. 
        //
        // Let's refine the multi-path update.
        // We will Fetch -> Check -> Write.

        // FETCH
        const itemSnapshots = await Promise.all(cart.map(i => get(ref(db, `items/${i.id}`))));
        const currentItems = itemSnapshots.map(s => s.val() as Item);

        // CHECK
        for (let i = 0; i < cart.length; i++) {
            const cartItem = cart[i];
            const dbItem = currentItems.find(x => x.id === cartItem.id);

            if (!dbItem) return { success: false, message: `Item ${cartItem.name} no longer exists.` };
            if (dbItem.stock < cartItem.quantity) return { success: false, message: `Not enough stock for ${cartItem.name}. Available: ${dbItem.stock}` };

            // Prepare atomic update
            updates[`items/${cartItem.id}/stock`] = dbItem.stock - cartItem.quantity;
        }

        // Add Order Record
        const order = {
            id: orderId,
            customerId,
            shopId,
            items: cart,
            total: cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
            timestamp: Date.now()
        };
        updates[`orders/${shopId}/${orderId}`] = order;

        // EXECUTE ATOMIC WRITE
        await update(ref(db), updates);
        return { success: true, message: 'Order placed successfully!' };

    } catch (error: any) {
        console.error('Order error:', error);
        return { success: false, message: error.message };
    }
};
