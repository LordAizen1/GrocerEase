import React, { useEffect } from 'react';
import { Redirect, Route, useLocation, useHistory } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { App as CapacitorApp } from '@capacitor/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark Mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomerHome from './pages/CustomerHome';
import ShopDetails from './pages/ShopDetails';
import Checkout from './pages/Checkout';
import { UserProvider, useUser } from './contexts/UserContext';

setupIonicReact();

const AppRoutes: React.FC = () => {
  const { user, loading } = useUser();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const handleBackButton = async () => {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname === '/owner' || location.pathname === '/customer' || location.pathname === '/login' || location.pathname === '/') {
          CapacitorApp.exitApp();
        } else {
          history.goBack();
        }
      });
    };
    handleBackButton();
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [location, history]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <IonRouterOutlet>
      <Route exact path="/login">
        {user ? <Redirect to={user.role === 'owner' ? '/owner' : '/customer'} /> : <Login />}
      </Route>
      <Route exact path="/owner">
        <OwnerDashboard />
      </Route>
      <Route exact path="/customer">
        <CustomerHome />
      </Route>
      <Route exact path="/shop/:id">
        <ShopDetails />
      </Route>
      <Route exact path="/checkout">
        <Checkout />
      </Route>
      <Route exact path="/">
        <Redirect to={user ? (user.role === 'owner' ? '/owner' : '/customer') : "/login"} />
      </Route>
    </IonRouterOutlet>
  );
};

const App: React.FC = () => (
  <IonApp>
    <UserProvider>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </UserProvider>
  </IonApp>
);

export default App;
