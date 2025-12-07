import React, { useEffect, useState } from 'react';
import {
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonBadge, IonButtons, IonIcon,
    IonToast, useIonViewWillEnter
} from '@ionic/react';
import { getItems, Item, CartItem } from '../services/dataService';
import { useParams, useHistory } from 'react-router';
import { cartOutline, checkmarkCircle } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

const ShopDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const history = useHistory();
    const [showToast, setShowToast] = useState(false);

    useIonViewWillEnter(() => {
        loadData();
    });

    const loadData = () => {
        loadItems();
        loadCart();
    };

    const loadItems = async () => {
        if (id) {
            const data = await getItems(id);
            setItems(data);
        }
    };

    const loadCart = async () => {
        const { value } = await Preferences.get({ key: 'cart' });
        if (value) {
            setCart(JSON.parse(value));
        } else {
            setCart([]);
        }
    };

    const addToCart = async (item: Item) => {
        const newCart = [...cart];
        const existingIndex = newCart.findIndex(i => i.id === item.id);

        // Check if item from different shop?
        // For simplicity, allow mixing or basic warning. 
        // Usually one shop at a time.
        if (newCart.length > 0 && newCart[0].shopId !== item.shopId) {
            if (!confirm('Adding items from a different shop will clear your cart. Proceed?')) return;
            newCart.length = 0;
        }

        if (existingIndex >= 0) {
            newCart[existingIndex].quantity += 1;
        } else {
            newCart.push({ ...item, quantity: 1 });
        }

        setCart(newCart);
        await Preferences.set({ key: 'cart', value: JSON.stringify(newCart) });
        setShowToast(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Shop Items</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push('/checkout')}>
                            <IonIcon icon={cartOutline} />
                            <IonBadge color="danger">{cart.reduce((acc, i) => acc + i.quantity, 0)}</IonBadge>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow>
                        {items.map(item => (
                            <IonCol size="6" sizeMd="4" sizeLg="3" key={item.id}>
                                <IonCard style={{ margin: '8px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e: any) => { e.target.src = 'https://placehold.co/300x200?text=No+Image' }}
                                        />
                                    </div>
                                    <IonCardHeader className="ion-no-padding" style={{ padding: '12px 12px 0' }}>
                                        <IonCardTitle style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.name}</IonCardTitle>
                                        <IonCardSubtitle style={{ color: 'var(--ion-color-primary)', fontWeight: 'bold', marginTop: '4px' }}>
                                            ${item.price.toFixed(2)}
                                        </IonCardSubtitle>
                                    </IonCardHeader>
                                    <IonCardContent style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Stock: {item.stock}</span>
                                        </div>
                                        <IonButton
                                            expand="block"
                                            size="small"
                                            color={item.stock > 0 ? 'success' : 'medium'}
                                            disabled={item.stock <= 0}
                                            onClick={() => addToCart(item)}
                                            style={{ '--border-radius': '8px', fontWeight: 'bold' }}
                                        >
                                            {item.stock > 0 ? 'ADD' : 'Out of Stock'}
                                        </IonButton>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Item added to cart"
                    duration={1000}
                    color="success"
                    icon={checkmarkCircle}
                />
            </IonContent>
        </IonPage>
    );
};

export default ShopDetails;
