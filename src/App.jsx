import { useState, useEffect } from 'react';

import Navigation from './components/Navigation';
import SaleScreen from './components/SaleScreen';
import ProductList from './components/ProductList';
import SalesHistory from './components/SalesHistory';
import Reports from './components/Reports';
import ExpenseList from './components/ExpenseList';
import SupplierList from './components/SupplierList';
import ClientList  from './components/ClientList';
import LoginScreen from './components/LoginScreen';

const App = () => {
  const [activeTab, setActiveTab] = useState('sale');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar si hay tokens guardados al iniciar la app para mantener la sesión
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (token && refresh) {
      setIsLoggedIn(true);
    }
  }, []);

  // Escuchar eventos de logout forzado (ej. cuando expira el refresh token en Axios)
  useEffect(() => {
    const handleForcedLogout = () => {
      handleLogout();
    };

    window.addEventListener('auth_logout', handleForcedLogout);
    return () => {
      window.removeEventListener('auth_logout', handleForcedLogout);
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col p-2 md:p-3">
        {!isLoggedIn ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <>
            <div className="shrink-0 no-print">
              <Navigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                includeSuppliers={true}
                includeClients={true}
                onLogout={handleLogout}
              />
            </div>

            <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="h-full">
                {activeTab === 'sale' && <SaleScreen />}
                {activeTab === 'products' && (
                  <div className="fade-in">
                    <ProductList />
                  </div>
                )}
                {activeTab === 'history' && <SalesHistory />}
                {activeTab === 'reports' && <Reports />}
                {activeTab === 'expenses' && <ExpenseList />}
                {activeTab === 'suppliers' && <SupplierList />}
                {activeTab === 'clients' && <ClientList />}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
