import React, { useEffect, useState } from 'react';
import {
    IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel,
    IonNote, IonFooter, IonLoading, IonAlert, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { CartItem, placeOrder, getShops, Shop } from '../services/dataService';
import { Geolocation } from '@capacitor/geolocation';
import { useHistory } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { trashOutline } from 'ionicons/icons';

const Checkout: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [shop, setShop] = useState<Shop | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const history = useHistory();
    const { user } = useUser();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        // Load Cart
        const { value } = await Preferences.get({ key: 'cart' });
        if (!value) {
            setLoading(false);
            return;
        }
        const cartItems: CartItem[] = JSON.parse(value);
        setCart(cartItems);

        if (cartItems.length > 0) {
            const shopId = cartItems[0].shopId;
            // Fetch Shop
            const shops = await getShops();
            const foundShop = shops.find(s => s.id === shopId);
            setShop(foundShop || null);

            if (foundShop) {
                // Get Location & Dist
                try {
                    const pos = await Geolocation.getCurrentPosition();
                    const d = calculateDistance(pos.coords.latitude, pos.coords.longitude, foundShop.lat, foundShop.lng);
                    setDistance(d);
                } catch (e) {
                    console.error("Loc error", e);
                }
            }
        }
        setLoading(false);
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const handlePlaceOrder = async () => {
        if (!shop) return;
        setPlacingOrder(true);

        // Atomic Transaction
        const result = await placeOrder(cart, shop.id, user ? user.uid : 'guest');

        setPlacingOrder(false);

        if (result.success) {
            alert('Order Placed! ' + result.message);
            await Preferences.remove({ key: 'cart' });
            setCart([]);
            history.replace('/customer');
        } else {
            alert('Failed: ' + result.message);
        }
    };

    const removeFromCart = async (itemId: string) => {
        const newCart = cart.filter(i => i.id !== itemId);
        setCart(newCart);
        await Preferences.set({ key: 'cart', value: JSON.stringify(newCart) });
        if (newCart.length === 0) setShop(null);
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const eta = distance ? (distance / 20) * 60 : 0; // 20km/hr -> mins

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Checkout</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
                        <div style={{ fontSize: '4rem' }}>🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Go back to find some fresh produce!</p>
                    </div>
                ) : (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <IonCard style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                            <IonCardHeader>
                                <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Order Summary</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent className="ion-no-padding">
                                <IonList lines="full">
                                    {cart.map(item => (
                                        <IonItem key={item.id} style={{ '--padding-start': '16px' }}>
                                            <IonLabel>
                                                <h2 style={{ fontWeight: '600' }}>{item.name}</h2>
                                                <p style={{ color: '#666' }}>Quantity: {item.quantity} x ${item.price.toFixed(2)}</p>
                                            </IonLabel>
                                            <div slot="end" style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>${(item.price * item.quantity).toFixed(2)}</div>
                                                <IonButton
                                                    fill="clear"
                                                    color="danger"
                                                    size="small"
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ height: '30px', margin: 0 }}
                                                >
                                                    <IonIcon icon={trashOutline} slot="icon-only" />
                                                </IonButton>
                                            </div>
                                        </IonItem>
                                    ))}
                                </IonList>
                            </IonCardContent>
                        </IonCard>

                        <div style={{ padding: '0 8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>Total Amount</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'black' }}>${total.toFixed(2)}</span>
                            </div>

                            {shop && (
                                <div style={{ padding: '16px', borderRadius: '12px', background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32' }}>
                                    <h3 style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '1rem' }}>Delivery Details</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>🏪 Shop</span>
                                        <span style={{ fontWeight: '600' }}>{shop.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>📍 Distance</span>
                                        <span style={{ fontWeight: '600' }}>{distance ? distance.toFixed(2) + ' km' : 'Calculating...'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>⏱️ ETA</span>
                                        <span style={{ fontWeight: '600' }}>{distance ? Math.ceil(eta) + ' mins' : '...'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <IonLoading isOpen={placingOrder} message="Placing Order..." spinner="crescent" />
            </IonContent>
            {cart.length > 0 && (
                <IonFooter>
                    <IonToolbar className="ion-padding">
                        <IonButton expand="block" onClick={handlePlaceOrder} disabled={placingOrder}>
                            Place Order
                        </IonButton>
                    </IonToolbar>
                </IonFooter>
            )}
        </IonPage>
    );
};

export default Checkout;
