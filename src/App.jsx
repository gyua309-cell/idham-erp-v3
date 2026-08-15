import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { StockCard } from './pages/StockCard';
import { WarehouseComparison } from './pages/WarehouseComparison';
import { ConsolidatedBalances } from './pages/ConsolidatedBalances';

export const App = () => {
  const { currentRoute, fetchAllData } = useAppStore();

  useEffect(() => {
    fetchAllData();
  }, []);

  const renderRoute = () => {
    switch (currentRoute) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'stock-card': return <StockCard />;
      case 'warehouse-comparison': return <WarehouseComparison />;
      case 'consolidated-balances': return <ConsolidatedBalances />;
      case 'sales-invoices': return <Dashboard />;
      case 'purchase-invoices': return <Dashboard />;
      case 'customers': return <ConsolidatedBalances />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main>{renderRoute()}</main>
      </div>
      <Toast />
    </div>
  );
};

export default App;
