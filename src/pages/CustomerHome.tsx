import React, { useEffect, useState } from 'react';
import {
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonButtons, IonIcon
} from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import { getShops, Shop } from '../services/dataService';
import { useUser } from '../contexts/UserContext';
import { useHistory } from 'react-router';
import { cartOutline } from 'ionicons/icons';

const CustomerHome: React.FC = () => {
    const [shops, setShops] = useState<(Shop & { distance?: number })[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useUser();
    const history = useHistory();

    useEffect(() => {
        if (user && user.role === 'owner') {
            history.replace('/owner');
        }
    }, [user]);

    // Haversine Formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    useEffect(() => {
        const init = async () => {
            try {
                const coordinates = await Geolocation.getCurrentPosition();
                const userLat = coordinates.coords.latitude;
                const userLng = coordinates.coords.longitude;
                setLocation({ lat: userLat, lng: userLng });

                const shopData = await getShops();
                const shopsWithDist = shopData.map(shop => ({
                    ...shop,
                    distance: calculateDistance(userLat, userLng, shop.lat, shop.lng)
                })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

                setShops(shopsWithDist);
            } catch (e) {
                console.error('Error getting location or shops', e);
                // Fallback if location fails: just show shops unsorted
                const shopData = await getShops();
                setShops(shopData);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar color="primary" style={{ paddingBottom: '10px' }}>
                    <IonTitle style={{ fontWeight: '800', fontSize: '1.5rem', color: 'black' }}>GrocerEase</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push('/checkout')} style={{ color: 'black' }}>
                            <IonIcon icon={cartOutline} size="large" />
                        </IonButton>
                        <IonButton onClick={() => { logout(); history.replace('/login'); }} style={{ color: 'black', fontWeight: '600' }}>Logout</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent style={{ '--background': '#f4f6f8' }}>
                {loading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><IonSpinner name="crescent" color="primary" /></div>}

                {!loading && (
                    <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
                            <h2 style={{ margin: '0 0 4px', fontWeight: '800', color: '#1a1a1a', fontSize: '1.8rem' }}>Nearby Stores</h2>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                                fresh groceries delivered in minutes
                                {location && <span style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>📍 {location.lat.toFixed(2)}, {location.lng.toFixed(2)}</span>}
                            </p>
                        </div>

                        {shops.map((shop, index) => (
                            <IonCard key={shop.id} button onClick={() => history.push(`/shop/${shop.id}`)} style={{ margin: '0 0 20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', overflow: 'hidden', border: 'none', background: 'white' }}>
                                <div style={{ height: '160px', width: '100%', position: 'relative', background: '#f0f0f0' }}>
                                    {shop.image ? (
                                        <img
                                            src={shop.image}
                                            alt={shop.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e: any) => { e.target.style.display = 'none' }}
                                        />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#ccc' }}>
                                            🏪
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', color: 'black', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                        {shop.distance ? `${shop.distance.toFixed(1)} km` : '? km'}
                                    </div>
                                </div>
                                <IonCardHeader style={{ padding: '16px 20px' }}>
                                    <IonCardTitle style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1a1a' }}>{shop.name}</IonCardTitle>
                                    <IonCardSubtitle style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#666' }}>
                                        <span style={{ color: 'var(--ion-color-success)', fontWeight: 'bold', background: 'rgba(11, 132, 87, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>Open</span> <span>•</span> <span>Groceries & Essentials</span>
                                    </IonCardSubtitle>
                                </IonCardHeader>
                            </IonCard>
                        ))}
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default CustomerHome;
