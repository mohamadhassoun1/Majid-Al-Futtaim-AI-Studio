import React, { useState } from 'react';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStore: (storeCode: string) => void;
    selectedStoreCode: string;
    onNavigateToAdmin: () => void;
    stores: { code: string; name: string }[];
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onSelectStore, selectedStoreCode, onNavigateToAdmin, stores }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay with blur effect */}
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Menu Panel */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <button 
                            onClick={onNavigateToAdmin}
                            className="w-full text-left block px-4 py-3 mb-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                        >
                            Admin Panel
                        </button>
                        <h2 className="text-lg font-semibold text-text-dark mb-2">Stores List</h2>
                        <input
                            type="text"
                            placeholder="Search stores by name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-border-color bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto no-scrollbar">
                        <ul>
                            {filteredStores.map((store) => (
                                <li key={`${store.code}-${store.name}`} className={`border-b last:border-b-0 transition-colors ${selectedStoreCode === store.code ? 'bg-primary/10' : ''}`}>
                                    <button 
                                        onClick={() => onSelectStore(store.code)}
                                        className="w-full text-left block px-4 py-3 hover:bg-gray-100"
                                    >
                                        <p className={`font-medium text-sm ${selectedStoreCode === store.code ? 'text-primary' : 'text-text-dark'}`}>{store.name}</p>
                                        <p className="text-xs text-text-light">Code: {store.code}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default SideMenu;
