
// App.tsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import StorePage from './components/StorePage';
import { User, Item, Staff, AccessCode } from './types';
import { stores as staticStores } from './data/stores';

const getInitialData = () => {
  const staff: Staff[] = [];
  const accessCodes: AccessCode[] = [];
  const items: Item[] = [];

  const initialStaffId = 'STAFF-1';
  const initialStoreCode = 'C42';
  staff.push({
      staffId: initialStaffId,
      name: 'John Doe',
      storeId: initialStoreCode,
  });
  const initialCode = 'ABCDE';
  accessCodes.push({
      code: initialCode,
      staffId: initialStaffId,
      createdAt: Date.now(),
      storeCode: initialStoreCode,
  });
  
  const today = new Date();
  const expiringSoonDate = new Date();
  expiringSoonDate.setDate(today.getDate() + 5);
  const expiredDate = new Date();
  expiredDate.setDate(today.getDate() - 2);
  const activeDate = new Date();
  activeDate.setDate(today.getDate() + 10);
  const toYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

  items.push({
      itemId: 'item_1', name: 'Milk', category: 'Dairy', expirationDate: toYYYYMMDD(expiringSoonDate),
      notificationDays: 7, quantity: 2, imageUrl: 'https://i.imgur.com/iVv5vFw.png', addedByStaffId: initialStaffId, storeCode: initialStoreCode
  });
  items.push({
      itemId: 'item_2', name: 'Bread', category: 'Bakery', expirationDate: toYYYYMMDD(expiredDate),
      notificationDays: 3, quantity: 1, imageUrl: 'https://i.imgur.com/T5f1p3w.png', addedByStaffId: initialStaffId, storeCode: initialStoreCode
  });
  items.push({
      itemId: 'item_3', name: 'Cheese', category: 'Dairy', expirationDate: toYYYYMMDD(activeDate),
      notificationDays: 14, quantity: 5, imageUrl: 'https://i.imgur.com/eAnC7Vz.png', addedByStaffId: initialStaffId, storeCode: 'C16'
  });

  return { staff, accessCodes, items };
};


const App: React.FC = () => {
  const [initialData] = useState(getInitialData());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>(initialData.items);
  const [staff, setStaff] = useState<Staff[]>(initialData.staff);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>(initialData.accessCodes);
  const [stores] = useState<{ code: string; name: string }[]>(staticStores);
  
  const [currentAdminView, setCurrentAdminView] = useState<'admin' | 'dashboard'>('admin');

  const ADMIN_PASSWORD = 'mohamadhassoun012@gmail.com';

  const handleLogin = (role: 'admin' | 'staff', credential: string) => {
      if (role === 'admin') {
          if (credential === ADMIN_PASSWORD) {
              const user: User = { role: 'admin', staffId: 'admin_user', name: 'Admin', credential };
              setCurrentUser(user);
              setCurrentAdminView('admin');
              return;
          }
          throw new Error('Invalid admin password.');
      }
      
      if (role === 'staff') {
          const code = accessCodes.find(c => c.code.toUpperCase() === credential.toUpperCase());
          if (code) {
              const staffMember = staff.find(s => s.staffId === code.staffId);
              if (staffMember) {
                  const user: User = {
                      role: 'staff',
                      staffId: staffMember.staffId,
                      storeId: staffMember.storeId,
                      name: staffMember.name,
                      credential,
                  };
                  setCurrentUser(user);
                  return;
              }
          }
          throw new Error('Invalid access code.');
      }
  };


  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddItem = (item: Omit<Item, 'itemId' | 'addedByStaffId' | 'storeCode'>) => {
    if (!currentUser) return;
    const newItem: Item = {
      ...item,
      itemId: `item_${Date.now()}`,
      addedByStaffId: currentUser.staffId,
      storeCode: currentUser.storeId,
    };
    setItems(prevItems => [...prevItems, newItem]);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems(prevItems => prevItems.map(item => item.itemId === updatedItem.itemId ? updatedItem : item));
  };
  
  const handleDeleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
  };

  const handleAddStaffAndCode = (storeCode: string, staffIdInput: string): boolean => {
    const newStaffId = staffIdInput.trim() || `staff_${Date.now()}`;
    if (staff.some(s => s.staffId === newStaffId)) {
        alert('Staff ID already exists.');
        return false;
    }
    
    const newStaffMember: Staff = { staffId: newStaffId, storeId: storeCode, name: newStaffId };
    setStaff(prev => [...prev, newStaffMember]);

    const generateAccessCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode = generateAccessCode();
    const newAccessCode: AccessCode = { code: newCode, staffId: newStaffId, createdAt: Date.now(), storeCode };
    setAccessCodes(prev => [...prev, newAccessCode]);
    
    alert(`Successfully created staff ${newStaffId} with access code ${newCode}`);
    return true;
  };

  const handleDeleteCode = (codeToDelete: AccessCode) => {
    if (!window.confirm(`Are you sure you want to delete the code for Staff ID: ${codeToDelete.staffId}? This will also delete the staff member.`)) return;
    const staffIdToDelete = codeToDelete.staffId;
    setAccessCodes(prev => prev.filter(c => c.staffId !== staffIdToDelete));
    setStaff(prev => prev.filter(s => s.staffId !== staffIdToDelete));
  };

  const navigateToDashboard = () => setCurrentAdminView('dashboard');
  const navigateToAdmin = () => setCurrentAdminView('admin');

  if (!currentUser) {
    return <LoginPage onLoginAttempt={handleLogin} />;
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
        return <LoginPage onLoginAttempt={handleLogin} />;
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-text-dark">
      {renderContent()}
    </div>
  );
};

export default App;
