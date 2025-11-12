
// components/Dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Item, Status, User } from '../types';
import ItemForm from './ItemForm';
import ItemCard from './ItemCard';
import DashboardHeader from './DashboardHeader';
import BottomNavBar from './BottomNavBar';
import AlertsView from './AlertsView';
import SideMenu from './SideMenu';
import StaffLeaderboard from './StaffLeaderboard';
import { getDaysRemaining, getStatus } from '../utils/statusHelper';
import { GoogleGenAI } from "@google/genai";

interface AppData {
  items: Item[];
  staff: any[];
  accessCodes: any[];
  stores: { code: string, name: string }[];
}

interface DashboardProps {
    appData: AppData;
    currentUser: User;
    onNavigateToAdmin: () => void;
    onAddItem: (item: Omit<Item, 'itemId' | 'addedByStaffId' | 'storeCode'>) => void;
    onUpdateItem: (item: Item) => void;
    onDeleteItem: (itemId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appData, currentUser, onNavigateToAdmin, onAddItem, onUpdateItem, onDeleteItem }) => {
  const { stores, items: allItems, staff, accessCodes } = appData;
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<Item> | null>(null);
  const [activeFilter, setActiveFilter] = useState<Status>(Status.ExpiringSoon);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'items' | 'alerts' | 'ranks' | 'ai'>('items');
  const [showAllDates, setShowAllDates] = useState(false);

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isSideMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSideMenuOpen]);
  
  const currentStoreItems = useMemo(() => {
      return allItems.filter(item => item.storeCode === selectedStore.code);
  }, [allItems, selectedStore.code]);

  const handleAddItemSubmit = (item: Omit<Item, 'itemId' | 'addedByStaffId' | 'storeCode'>) => {
    onAddItem(item);
  };

  const handleUpdateItemSubmit = (updatedItem: Item) => {
    onUpdateItem(updatedItem);
  };

  const handleDeleteItemClick = (itemId: string) => {
      if (!window.confirm("Are you sure you want to delete this item?")) return;
      onDeleteItem(itemId);
  };
  
  const handleEditClick = (item: Item) => { setFormInitialData(item); setIsFormOpen(true); };
  
  const handleAddNewClick = () => { setActiveView('items'); setIsSearchVisible(false); setFormInitialData({}); setIsFormOpen(true); };

  const handleFormClose = () => { setIsFormOpen(false); setFormInitialData(null); };

  const handleHomeClick = () => { setActiveView('items'); setIsSearchVisible(false); };

  const handleSearchClick = () => { setIsSearchVisible(prev => !prev); if (!isSearchVisible) { setActiveView('items'); } setSearchQuery(''); };

  const handleAlertsClick = () => { setActiveView('alerts'); setIsSearchVisible(false); };

  const handleRanksClick = () => { setActiveView('ranks'); setIsSearchVisible(false); };
  
  const handleAiClick = () => { setActiveView('ai'); setIsSearchVisible(false); };

  const handleSelectStore = (storeCode: string) => {
      const newStore = stores.find(s => s.code === storeCode);
      if (newStore) setSelectedStore(newStore);
      setIsSideMenuOpen(false);
  };
  
  const handleAiQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isThinking) return;

    setIsThinking(true);
    setAiResponse('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const itemContext = currentStoreItems.map(item => 
            `- ${item.name} (Qty: ${item.quantity}, Expires: ${item.expirationDate})`
        ).join('\n');
        
        const systemInstruction = `You are an expert inventory analysis assistant for Majid Al Futtaim. The user is an admin looking at the '${selectedStore.name}' store. Analyze the provided inventory data to answer the user's question. Provide concise, actionable insights.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Inventory Data:\n${itemContext || 'No items in this store.'}\n\nUser Query: ${aiQuery}`,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        setAiResponse(response.text);
    } catch (error) {
        console.error("AI Error:", error);
        setAiResponse('Sorry, an error occurred while processing your request.');
    } finally {
        setIsThinking(false);
    }
  };

  const categorizedItems = useMemo(() => {
    const allCategorized: Record<Status, Item[]> = {
      [Status.Active]: [],
      [Status.ExpiringSoon]: [],
      [Status.Expired]: [],
    };

    currentStoreItems.forEach(item => {
      const status = getStatus(item.expirationDate);
      allCategorized[status].push(item);
    });

    const sortedActive = allCategorized[Status.Active].sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    const sortedExpiringSoon = allCategorized[Status.ExpiringSoon].sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    const sortedExpired = allCategorized[Status.Expired].sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime());
    
    return {
        [Status.Active]: sortedActive,
        [Status.ExpiringSoon]: sortedExpiringSoon,
        [Status.Expired]: sortedExpired,
    };
  }, [currentStoreItems]);

  const displayedItems = useMemo(() => {
    let itemsToDisplay: Item[];
    if (showAllDates) {
        itemsToDisplay = [...currentStoreItems].sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    } else {
        itemsToDisplay = categorizedItems[activeFilter] || [];
    }
    
    if (isSearchVisible && searchQuery) {
        return itemsToDisplay.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return itemsToDisplay;
  }, [categorizedItems, activeFilter, isSearchVisible, searchQuery, showAllDates, currentStoreItems]);

  const handleExportView = () => {
    if (displayedItems.length === 0) {
        alert("There are no items in the current view to export.");
        return;
    }

    const headers = ['Item Name', 'Expiry Date', 'Days Until Expiry', 'Status'];
    const csvRows = [
        headers.join(','),
        ...displayedItems.map(item => {
            const daysRemaining = getDaysRemaining(item.expirationDate);
            const status = getStatus(item.expirationDate);
            const row = [
                `"${item.name.replace(/"/g, '""')}"`,
                item.expirationDate,
                daysRemaining,
                status
            ];
            return row.join(',');
        })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${activeFilter.replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const renderMainContent = () => {
      switch(activeView) {
        case 'alerts': return <AlertsView items={currentStoreItems} onEdit={handleEditClick} onDelete={handleDeleteItemClick} />;
        case 'ranks': return <StaffLeaderboard allItems={allItems} staffList={staff} accessCodes={accessCodes} stores={stores} />;
        case 'ai': return (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-[#343A40] mb-4">Hassoun</h2>
                <div className="bg-[#F8F9FA] p-4 rounded-lg shadow-sm">
                    <form onSubmit={handleAiQuerySubmit}>
                        <textarea
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder="Ask a complex question about the inventory..."
                            className="w-full p-3 border border-border-color rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-[#2E3034] text-white placeholder-gray-400"
                            rows={3}
                            disabled={isThinking}
                        />
                        <button type="submit" disabled={isThinking || !aiQuery.trim()} className="mt-2 w-full bg-[#0D6EFD] text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-[#0B5ED7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isThinking ? 'Thinking...' : 'Ask AI'}
                        </button>
                    </form>
                    {isThinking && (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-text-light mt-2">Analyzing data...</p>
                        </div>
                    )}
                    {aiResponse && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                            <h3 className="font-semibold text-[#212529] mb-2">Response:</h3>
                            <p className="text-sm text-[#212529] whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        );
        case 'items': default:
            return (
                <>
                    <div className={`flex justify-between items-center mb-4 bg-gray-100 p-1 rounded-full space-x-1 transition-opacity ${showAllDates ? 'opacity-50 pointer-events-none' : ''}`}>
                        {[Status.ExpiringSoon, Status.Active, Status.Expired].map(status => (
                            <button key={status} onClick={() => setActiveFilter(status)} disabled={showAllDates} className={`w-full py-2 px-2 text-sm font-semibold rounded-full transition-all ${activeFilter === status ? 'bg-primary text-white shadow-md' : 'bg-transparent text-text-light hover:bg-gray-200'}`}>
                                {status} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${activeFilter === status ? 'bg-white/20' : 'bg-gray-200'}`}>{(categorizedItems[status] || []).length}</span>
                            </button>
                        ))}
                    </div>
                     <div className="flex justify-end items-center space-x-4 mb-4">
                        <label htmlFor="show-all-toggle-admin" className="flex items-center cursor-pointer">
                            <span className="mr-2 text-sm font-medium text-text-light">Show All Dates</span>
                            <div className="relative">
                                <input id="show-all-toggle-admin" type="checkbox" className="sr-only peer" checked={showAllDates} onChange={() => setShowAllDates(!showAllDates)} />
                                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                        </label>
                        <button 
                            onClick={handleExportView}
                            className="flex items-center space-x-1.5 bg-primary text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                            disabled={displayedItems.length === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>Export</span>
                        </button>
                    </div>
                    {displayedItems.length > 0 ? (
                        <div className="space-y-3">
                            {displayedItems.map(item => <ItemCard key={item.itemId} item={item} onEdit={handleEditClick} onDelete={handleDeleteItemClick} />)}
                        </div>
                    ) : (
                        <p className="text-center py-10 text-text-light text-sm">{searchQuery ? `No items found for "${searchQuery}".` : `No items in the "${activeFilter}" category.`}</p>
                    )}
                </>
            );
      }
  }

  return (
    <div className={`fixed inset-0 transition-all duration-300 ${isSideMenuOpen ? 'sm:scale-95 sm:rounded-3xl' : 'sm:scale-100 sm:rounded-none'}`}>
        <div className="max-w-md mx-auto bg-background min-h-full sm:shadow-2xl sm:rounded-2xl sm:my-4 pb-28 overflow-y-auto hide-scrollbar">
            <div className={`transition-all duration-300 ${isSideMenuOpen ? 'blur-sm brightness-90' : 'blur-0'}`}>
                <main className="p-4 sm:p-6">
                    <DashboardHeader userName={currentUser.name} storeName={selectedStore.name} onMenuClick={() => setIsSideMenuOpen(true)} />
                    {isSearchVisible && (
                        <div className="mb-4"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items..." className="w-full px-4 py-3 border rounded-lg" autoFocus/></div>
                    )}
                    {renderMainContent()}
                </main>
            </div>
            <BottomNavBar onAddClick={handleAddNewClick} onHomeClick={handleHomeClick} onSearchClick={handleSearchClick} onAlertsClick={handleAlertsClick} onRanksClick={handleRanksClick} onAiClick={handleAiClick} isSearchActive={isSearchVisible} isHomeActive={activeView === 'items'} isAlertsActive={activeView === 'alerts'} isRanksActive={activeView === 'ranks'} isAiActive={activeView === 'ai'} />
        </div>
      {isFormOpen && <ItemForm onClose={handleFormClose} onAddItem={handleAddItemSubmit} onUpdateItem={handleUpdateItemSubmit} initialData={formInitialData} />}
      <SideMenu isOpen={isSideMenuOpen} stores={stores} onClose={() => setIsSideMenuOpen(false)} onSelectStore={handleSelectStore} selectedStoreCode={selectedStore.code} onNavigateToAdmin={onNavigateToAdmin} />
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default Dashboard;
