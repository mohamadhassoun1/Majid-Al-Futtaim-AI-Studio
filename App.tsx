
// App.tsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import StorePage from './components/StorePage';
import { User, Item, Staff, AccessCode } from './types';
import { stores as staticStores } from './data/stores';
import { apiGet, apiPost } from './utils/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [stores, setStores] = useState<{ code: string; name: string }[]>(staticStores); // Start with static, then fetch
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentAdminView, setCurrentAdminView] = useState<'admin' | 'dashboard'>('admin');

  const fetchData = async (user: User) => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (user.role === 'admin') {
        data = await apiGet('?path=data/all');
      } else {
        data = await apiGet(`?path=data/store&storeCode=${user.storeId}`);
      }
      setItems(data.items || []);
      setStaff(data.staff || []);
      setAccessCodes(data.accessCodes || []);
      setStores(data.stores || []); // Update stores from backend
    } catch (e) {
      setError('Failed to load application data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    fetchData(user);
    if (user.role === 'admin') {
      setCurrentAdminView('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Clear all data on logout
    setItems([]);
    setStaff([]);
    setAccessCodes([]);
  };

  const handleAddItem = async (item: Omit<Item, 'itemId' | 'addedByStaffId'>, storeCode: string) => {
    try {
      await apiPost('/items', { ...item, staffId: currentUser?.staffId, storeCode });
      fetchData(currentUser!); // Refetch data to show the new item
    } catch (e) {
      alert('Failed to add item. Please try again.');
    }
  };

  const handleUpdateItem = (updatedItem: Item) => {
      // This would require a new /items/update endpoint. For now, we refetch.
      console.log("Update functionality would require a backend endpoint.", updatedItem);
  };
  
  const handleDeleteItem = (itemId: string) => {
      // This would require a new /items/delete endpoint.
      console.log("Delete functionality would require a backend endpoint.", itemId);
  };

  const handleAddStaffAndCode = async (storeCode: string, staffIdInput: string) => {
    try {
      const result = await apiPost('/admin/staff', { storeCode, staffId: staffIdInput });
      alert(`Successfully created staff ${result.staffId} with access code ${result.accessCode}`);
      fetchData(currentUser!); // Refetch to get updated staff/codes list
      return true;
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      return false;
    }
  };

  const handleDeleteCode = (codeToDelete: AccessCode) => {
      // This would require a new /admin/codes/delete endpoint.
      console.log("Delete code functionality would require a backend endpoint.", codeToDelete);
  };

  const navigateToDashboard = () => setCurrentAdminView('dashboard');
  const navigateToAdmin = () => setCurrentAdminView('admin');

  if (!currentUser) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
      );
  }

  if (error) {
       return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <p className="text-error text-center">{error}</p>
              <button onClick={handleLogout} className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-lg">
                  Back to Login
              </button>
          </div>
       );
  }

  const appData = { items, staff, accessCodes, stores };

  const renderContent = () => {
    switch (currentUser.role) {
      case 'admin':
        return currentAdminView === 'admin' ? (
          <AdminPage 
            appData={appData} 
            onNavigateToDashboard={navigateToDashboard} 
            onLogout={handleLogout}
            onAddStaffAndCode={handleAddStaffAndCode}
            onDeleteCode={handleDeleteCode}
          />
        ) : (
          <Dashboard 
            appData={appData} 
            currentUser={currentUser} 
            onNavigateToAdmin={navigateToAdmin} 
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        );
      case 'staff':
        return <StorePage 
            appData={appData} 
            currentUser={currentUser} 
            onLogout={handleLogout}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
        />;
      default:
        return <LoginPage onLogin={handleLoginSuccess} />;
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-text-dark">
      {renderContent()}
    </div>
  );
};

export default App;
