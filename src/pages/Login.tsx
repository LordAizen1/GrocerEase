import React, { useState } from 'react';
import {
    IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel,
    IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonToast,
    IonCard, IonCardContent, IonList
} from '@ionic/react';
import { useUser } from '../contexts/UserContext';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState(''); // Empty to force manual entry
    const [role, setRole] = useState<'owner' | 'customer'>('owner');
    const { login } = useUser();
    const history = useHistory();
    const [showToast, setShowToast] = useState(false);

    const handleLogin = async () => {
        if (!email) {
            setShowToast(true);
            return;
        }
        const success = await login(email, role);
        if (success) {
            if (role === 'owner') {
                history.replace('/owner');
            } else {
                history.replace('/customer');
            }
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ color: 'var(--ion-color-primary)', fontWeight: 'bold', fontSize: '2.5rem', margin: 0 }}>GrocerEase</h1>
                        <p style={{ color: '#666', marginTop: '5px' }}>Fresh groceries at your doorstep</p>
                    </div>

                    <IonCard style={{ width: '100%', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                        <IonCardContent className="ion-padding-vertical">
                            <IonList lines="none">
                                <IonItem>
                                    <IonLabel position="stacked" color="medium">Email Address</IonLabel>
                                    <IonInput
                                        value={email}
                                        onIonInput={e => setEmail(e.detail.value!)}
                                        type="email"
                                        style={{ '--padding-start': '0' }}
                                    />
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="stacked" color="medium">I am a...</IonLabel>
                                    <IonSelect value={role} onIonChange={e => setRole(e.detail.value)} interface="popover">
                                        <IonSelectOption value="owner">Shop Owner</IonSelectOption>
                                        <IonSelectOption value="customer">Customer</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonList>

                            <div className="ion-padding">
                                <IonButton expand="block" shape="round" onClick={handleLogin} style={{ fontWeight: 'bold' }}>
                                    Login
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>

                    <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85em', marginTop: '30px' }}>
                        <p><strong>Demo Credentials:</strong></p>
                        <p>Owner: owner1@example.com</p>
                        <p>Customer: any email</p>
                    </div>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Please enter an email"
                    duration={2000}
                    color="warning"
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;
