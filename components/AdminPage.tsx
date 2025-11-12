// components/AdminPage.tsx
import React, { useState, useMemo } from 'react';
import { AccessCode, Item, Status, Staff } from '../types';
import { getStatus } from '../utils/statusHelper';
import AdminSideMenu from './AdminSideMenu';

interface AppData {
  items: Item[];
  staff: Staff[];
  accessCodes: AccessCode[];
  stores: { code: string; name: string }[];
}

interface AdminPageProps {
  appData: AppData;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
  onAddStaffAndCode: (storeCode: string, staffId: string) => Promise<boolean>;
  onDeleteCode: (code: AccessCode) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ appData, onNavigateToDashboard, onLogout, onAddStaffAndCode, onDeleteCode }) => {
  const { stores, items, staff, accessCodes } = appData;
  const [selectedStoreCode, setSelectedStoreCode] = useState(stores[0]?.code || '');
  const [staffId, setStaffId] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'stores' | 'codes'>('codes');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  const storeStats = useMemo(() => {
    const stats: Record<string, { expired: number; expiringSoon: number; active: number }> = {};
    const itemsByStore: { [key: string]: Item[] } = items.reduce((acc, item) => {
        const storeCode = item.storeCode;
        if (storeCode) {
            if (!acc[storeCode]) acc[storeCode] = [];
            acc[storeCode].push(item);
        }
        return acc;
    }, {} as { [key: string]: Item[] });

    stores.forEach(store => {
        const storeItems = itemsByStore[store.code] || [];
        const counts = { expired: 0, expiringSoon: 0, active: 0 };
        storeItems.forEach(item => {
            const status = getStatus(item.expirationDate);
            if (status === Status.Expired) counts.expired++;
            else if (status === Status.ExpiringSoon) counts.expiringSoon++;
            else counts.active++;
        });
        stats[store.code] = counts;
    });
    return stats;
  }, [items, stores]);

  const sortedStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      const statsA = storeStats[a.code] || { expired: 0, expiringSoon: 0 };
      const statsB = storeStats[b.code] || { expired: 0, expiringSoon: 0 };
      if (statsB.expired !== statsA.expired) return statsB.expired - statsA.expired;
      if (statsB.expiringSoon !== statsA.expiringSoon) return statsB.expiringSoon - statsA.expiringSoon;
      return a.name.localeCompare(b.name);
    });
  }, [stores, storeStats]);

  const handleAddStaffClick = async () => {
    const success = await onAddStaffAndCode(selectedStoreCode, staffId);
    if (success) {
      setStaffId('');
    }
  };

  const accessCodesByStore = useMemo(() => {
      return accessCodes.reduce((acc, code) => {
          if (!acc[code.storeCode]) {
              acc[code.storeCode] = [];
          }
          acc[code.storeCode].push(code);
          return acc;
      }, {} as {[key:string]: AccessCode[]})
  }, [accessCodes]);

  const renderCodesList = () => {
    let codesToDisplay: AccessCode[] = [];
    if (staffSearchQuery) {
        codesToDisplay = accessCodes.filter((code: AccessCode) => 
            code.staffId.toLowerCase().includes(staffSearchQuery.toLowerCase())
        );
        if (codesToDisplay.length === 0) {
            return <p className="text-center text-gray-500 py-8">No staff found matching "{staffSearchQuery}".</p>;
        }
    } else {
        codesToDisplay = accessCodesByStore[selectedStoreCode] || [];
        if (codesToDisplay.length === 0) {
            return <p className="text-center text-gray-500 py-8">No access codes for this store.</p>;
        }
    }

    return (
        <ul className="space-y-3">
            {codesToDisplay.map((code: AccessCode) => {
                // For search results, the storeCode comes directly from the code object.
                const store = stores.find(s => s.code === code.storeCode);
                const storeName = store?.name || 'Unknown Store';
                return (
                    <li key={code.code} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-border-color">
                        <div>
                            <p className="font-mono text-lg text-primary">{code.code}</p>
                            <p className="text-sm">Staff ID: {code.staffId}</p>
                            {staffSearchQuery && <p className="text-xs text-text-light">Store: {storeName}</p>}
                        </div>
                        <button onClick={() => onDeleteCode(code)} className="text-error font-semibold text-sm hover:underline">Delete</button>
                    </li>
                );
            })}
        </ul>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className={`fixed inset-0 transition-all duration-300 ${isMenuOpen ? 'sm:scale-95 sm:rounded-3xl' : 'sm:scale-100 sm:rounded-none'}`}>
        <div className="max-w-4xl mx-auto bg-gray-50 h-full sm:shadow-2xl sm:rounded-2xl sm:my-4 overflow-y-auto pb-6">
          <div className={`transition-all duration-300 ${isMenuOpen ? 'blur-sm brightness-90' : 'blur-0'}`}>
            <header className="flex justify-between items-center p-4 sm:p-6 border-b border-border-color sticky top-0 bg-gray-50 z-10">
              <div>
                <h1 className="text-xl font-bold text-text-dark">Admin Panel</h1>
                <p className="text-sm text-text-light capitalize">{activeView.replace('_', ' ')}</p>
              </div>
              <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </header>
            <main className="p-4 sm:p-6">
              {activeView === 'stores' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedStores.map(store => {
                    const stats = storeStats[store.code] || { expired: 0, expiringSoon: 0, active: 0 };
                    return (
                        <div key={store.code} className="p-4 rounded-lg shadow-sm border bg-white hover:shadow-md hover:border-primary/50 transition-all duration-200">
                            <h3 className="font-bold text-text-dark truncate">{store.name} <span className="font-normal text-text-light">({store.code})</span></h3>
                            <div className="space-y-1 text-sm mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center"><span>Expired:</span><span className="font-bold text-status-expired bg-red-50 text-xs px-2 py-0.5 rounded-full">{stats.expired}</span></div>
                                <div className="flex justify-between items-center"><span>Expiring Soon:</span><span className="font-bold text-status-soon bg-amber-50 text-xs px-2 py-0.5 rounded-full">{stats.expiringSoon}</span></div>
                                <div className="flex justify-between items-center"><span>Active:</span><span className="font-bold text-status-active bg-green-50 text-xs px-2 py-0.5 rounded-full">{stats.active}</span></div>
                            </div>
                        </div>
                    );
                  })}
                </div>
              )}
              {activeView === 'codes' && (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-lg font-semibold text-text-dark mb-4">
                      {staffSearchQuery 
                          ? `Search Results for "${staffSearchQuery}"` 
                          : `Active Codes for ${stores.find(s => s.code === selectedStoreCode)?.name}`
                      }
                    </h2>
                    <input
                        type="text"
                        placeholder="Search all Staff IDs..."
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border border-border-color rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="mt-4">
                      {renderCodesList()}
                    </div>
                  </div>

                  <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-lg font-semibold text-text-dark mb-4">Add New Staff & Code</h2>
                    <label className="block text-sm font-medium text-text-dark mb-2">Select a Store:</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <select value={selectedStoreCode} onChange={(e) => setSelectedStoreCode(e.target.value)} className="block w-full px-4 py-3 text-base border border-border-color rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                            {sortedStores.map((store) => (<option key={store.code} value={store.code}>{store.name} ({store.code})</option>))}
                        </select>
                        <div className="space-y-2">
                            <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)} placeholder="Enter Staff ID or leave blank" className="w-full px-4 py-3 border border-border-color rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"/>
                        </div>
                    </div>
                    <button onClick={handleAddStaffClick} className="mt-4 w-full bg-primary text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-dark transition-colors">
                        Add Staff & Generate Code
                    </button>
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
      <AdminSideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigateToDashboard={onNavigateToDashboard} onLogout={onLogout} onSelectView={(v) => setActiveView(v)} activeView={activeView} />
    </div>
  );
};

export default AdminPage;
