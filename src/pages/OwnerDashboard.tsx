import React, { useEffect, useState } from 'react';
import {
    IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonAlert,
    IonSegment, IonSegmentButton, IonIcon, IonFab, IonFabButton
} from '@ionic/react';
import { add, trashOutline } from 'ionicons/icons';
import { useUser } from '../contexts/UserContext';
import { getItems, updateItem, Item, seedDatabase, createItem, deleteItem, getShopOrders } from '../services/dataService';
import { useHistory } from 'react-router';

const OwnerDashboard: React.FC = () => {
    const { user, logout } = useUser();
    const [items, setItems] = useState<Item[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'inventory' | 'orders'>('inventory');
    const history = useHistory();

    const loadData = async () => {
        if (!user?.shopId) return;
        setLoading(true);

        if (view === 'inventory') {
            const data = await getItems(user.shopId);
            setItems(data);
        } else {
            const data = await getShopOrders(user.shopId);
            // Sort by time desc
            setOrders(data.sort((a: any, b: any) => b.timestamp - a.timestamp));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user && user.role === 'customer') {
            history.replace('/customer');
            return;
        }
        loadData();
    }, [user, view]);

    const handleUpdate = async (item: Item, field: 'price' | 'stock', value: number) => {
        const updatedItems = items.map(i => i.id === item.id ? { ...i, [field]: value } : i);
        setItems(updatedItems);
        await updateItem(item.id, { [field]: value });
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm('Delete this item?')) return;
        await deleteItem(itemId);
        loadData();
    };

    const handleAddItem = async () => {
        const name = prompt('Item Name:');
        if (!name) return;
        const price = parseFloat(prompt('Price:') || '0');
        const stock = parseInt(prompt('Stock:') || '0');

        const newItem: Item = {
            id: `item_${user?.shopId}_${Date.now()}`,
            shopId: user?.shopId || '',
            name,
            price,
            stock,
            image: 'https://placehold.co/100'
        };

        await createItem(newItem);
        loadData();
    };

    const handleSeed = async () => {
        if (confirm('This will RESET the database. Are you sure?')) {
            setLoading(true);
            await seedDatabase();
            alert('Database seeded! Please re-login.');
            await logout();
            history.replace('/login');
        }
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar color="primary">
                    <IonTitle style={{ color: 'black', fontWeight: 'bold' }}>Owner Dashboard</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => { logout(); history.replace('/login'); }} style={{ color: 'black' }}>Logout</IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonToolbar color="primary">
                    <IonSegment value={view} onIonChange={e => setView(e.detail.value as any)} style={{ '--background': 'rgba(255,255,255,0.2)' }}>
                        <IonSegmentButton value="inventory" style={{ color: 'black', '--indicator-color': 'black' }}>
                            <IonLabel>Inventory</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="orders" style={{ color: 'black', '--indicator-color': 'black' }}>
                            <IonLabel>Orders</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ '--background': '#f4f6f8' }}>
                <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#666' }}>Welcome {user?.email} ({user?.shopId})</p>
                </div>

                {view === 'inventory' && (
                    <>
                        <IonList lines="none" style={{ background: 'transparent' }}>
                            {items.map(item => (
                                <IonCard key={item.id} style={{ marginBottom: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', background: 'white' }}>
                                    <IonCardContent style={{ padding: '0' }}>
                                        <IonItem lines="none" style={{ '--padding-start': '0', '--background': 'white' }}>
                                            <div slot="start" style={{ width: '80px', height: '80px', background: '#f4f4f4' }}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e: any) => { e.target.src = 'https://placehold.co/100' }}
                                                />
                                            </div>
                                            <IonLabel>
                                                <h2 style={{ fontWeight: 'bold', color: 'black' }}>{item.name}</h2>
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7em', color: '#888' }}>Price</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', background: '#f0f3f5', borderRadius: '6px', padding: '2px 8px' }}>
                                                            <span style={{ fontSize: '0.9em', color: 'black' }}>$</span>
                                                            <IonInput
                                                                type="number"
                                                                value={item.price}
                                                                onIonChange={e => handleUpdate(item, 'price', parseFloat(e.detail.value!))}
                                                                className="ion-no-padding custom-input"
                                                                style={{ '--padding-bottom': '0', '--padding-top': '0', width: '50px', color: 'black', '--placeholder-color': 'gray' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7em', color: '#888' }}>Stock</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', background: '#f0f3f5', borderRadius: '6px', padding: '2px 8px' }}>
                                                            <IonInput
                                                                type="number"
                                                                value={item.stock}
                                                                onIonChange={e => handleUpdate(item, 'stock', parseFloat(e.detail.value!))}
                                                                className="ion-no-padding custom-input"
                                                                style={{ '--padding-bottom': '0', '--padding-top': '0', width: '50px', color: 'black', '--placeholder-color': 'gray' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </IonLabel>
                                            <IonButton slot="end" color="danger" fill="clear" onClick={() => handleDelete(item.id)}>
                                                <IonIcon icon={trashOutline} />
                                            </IonButton>
                                        </IonItem>
                                    </IonCardContent>
                                </IonCard>
                            ))}
                        </IonList>

                        <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '80px' }}>
                            <IonButton size="small" fill="clear" color="medium" onClick={handleSeed}>
                                Reset Demo Data
                            </IonButton>
                        </div>

                        <IonFab vertical="bottom" horizontal="end" slot="fixed">
                            <IonFabButton onClick={handleAddItem}>
                                <IonIcon icon={add} />
                            </IonFabButton>
                        </IonFab>
                    </>
                )}

                {view === 'orders' && (
                    <IonList>
                        {orders.length === 0 && <p>No orders yet.</p>}
                        {orders.map(order => (
                            <IonCard key={order.id}>
                                <IonCardHeader>
                                    <IonCardSubtitle>{new Date(order.timestamp).toLocaleString()}</IonCardSubtitle>
                                    <IonCardTitle>Total: ${order.total}</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <p><strong>Customer:</strong> {order.customerId}</p>
                                    <ul>
                                        {order.items.map((i: any) => (
                                            <li key={i.id}>{i.quantity} x {i.name}</li>
                                        ))}
                                    </ul>
                                </IonCardContent>
                            </IonCard>
                        ))}
                    </IonList>
                )}
            </IonContent>
        </IonPage >
    );
};

export default OwnerDashboard;
