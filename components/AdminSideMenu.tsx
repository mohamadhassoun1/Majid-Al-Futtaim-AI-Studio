import React from 'react';

interface AdminSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateToDashboard: () => void;
    onLogout: () => void;
    onSelectView: (view: 'stores' | 'codes') => void;
    activeView: 'stores' | 'codes';
}

const AdminSideMenu: React.FC<AdminSideMenuProps> = ({ 
    isOpen, 
    onClose, 
    onNavigateToDashboard, 
    onLogout,
    onSelectView,
    activeView
}) => {
    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 space-y-2">
                     <button 
                        onClick={() => onSelectView('stores')}
                        className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'stores' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                        <span className="font-medium">Stores Overview</span>
                    </button>
                    <button 
                        onClick={() => onSelectView('codes')}
                        className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'codes' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        <span className="font-medium">Manage Codes</span>
                    </button>
                    
                    <hr className="my-2"/>

                    <button 
                        onClick={onNavigateToDashboard}
                        className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                        <span className="font-medium">Go to Dashboard</span>
                    </button>

                    <button 
                        onClick={onLogout}
                        className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-error hover:bg-red-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSideMenu;