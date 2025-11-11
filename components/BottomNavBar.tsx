import React from 'react';

interface NavItemProps {
    children: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ children, label, isActive = false, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-14 ${isActive ? 'text-primary' : 'text-gray-500'} hover:text-primary transition-colors`}>
        {children}
        <span className="text-xs">{label}</span>
    </button>
);

interface BottomNavBarProps {
    onAddClick: () => void;
    onHomeClick: () => void;
    onSearchClick: () => void;
    onAlertsClick: () => void;
    onRanksClick: () => void;
    onAiClick: () => void;
    isSearchActive: boolean;
    isAlertsActive: boolean;
    isHomeActive: boolean;
    isRanksActive: boolean;
    isAiActive: boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
    onAddClick, 
    onHomeClick, 
    onSearchClick, 
    onAlertsClick, 
    onRanksClick,
    onAiClick,
    isSearchActive, 
    isAlertsActive, 
    isHomeActive,
    isRanksActive,
    isAiActive
}) => {
    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/80 backdrop-blur-md rounded-full shadow-lg z-50">
            <div className="flex justify-around items-center h-16">
                <NavItem label="Home" isActive={isHomeActive} onClick={onHomeClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                </NavItem>
                <NavItem label="Search" onClick={onSearchClick} isActive={isSearchActive}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </NavItem>
                 <NavItem label="Add" onClick={onAddClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                </NavItem>
                <NavItem label="Alerts" onClick={onAlertsClick} isActive={isAlertsActive}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </NavItem>
                <NavItem label="Ranks" onClick={onRanksClick} isActive={isRanksActive}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 10-2 0v1.158l-3.23-1.615a1 1 0 00-1.11 1.664l2.12 4.242-2.39 2.39a1 1 0 000 1.414l4.242 2.121a1 1 0 001.664-1.11L10.842 13H12a1 1 0 100-2h-1.158l2.71-2.71a1 1 0 00-1.11-1.664L9 8.158V4a1 1 0 10-2 0v4.158l-2.71 2.71a1 1 0 001.11 1.664L8.158 10H10a1 1 0 100 2h1.158l-4.242 2.121a1 1 0 001.11 1.664L13 14.842V16a1 1 0 102 0v-1.158l4.242-2.121a1 1 0 00-1.11-1.664L14.842 12H14a1 1 0 100 2h.158l-2.71 2.71a1 1 0 001.11 1.664L16 16.842V18a1 1 0 102 0v-1.158l3.23 1.615a1 1 0 001.11-1.664L17.88 12.5l2.39-2.39a1 1 0 000-1.414l-4.242-2.121a1 1 0 00-1.664 1.11L15.158 9H14a1 1 0 100 2h1.158l-2.71 2.71a1 1 0 001.11 1.664L17 13.842V15a1 1 0 102 0v-1.158l.71.355a1 1 0 001.11-1.664l-3.23-1.615V10a1 1 0 10-2 0v.158l-2.71-2.71a1 1 0 00-1.11-1.664L11 8.842V7a1 1 0 10-2 0v1.842l-4.242-2.121a1 1 0 00-1.11 1.664L6.36 10.5l-2.39 2.39a1 1 0 000 1.414l4.242 2.121a1 1 0 001.664-1.11L7.842 13H8a1 1 0 100-2H7.842l2.71-2.71a1 1 0 00-1.11-1.664L6 9.842V8a1 1 0 10-2 0v1.842l-3.23 1.615a1 1 0 00-1.11-1.664l3.23-1.615V7a1 1 0 10-2 0v1.158l-2.12-4.242a1 1 0 00-1.11 1.664l2.12 4.242-2.39 2.39a1 1 0 000 1.414l4.242 2.121a1 1 0 001.664-1.11L4.842 13H6a1 1 0 100-2H4.842L2.13 8.29a1 1 0 00-1.11-1.664L4.242 9.5l2.39-2.39a1 1 0 000-1.414L2.39 1.458a1 1 0 00-1.664 1.11L3.842 7H4a1 1 0 100-2H3.842L1.13 2.29a1 1 0 001.11 1.664L5 5.842V7a1 1 0 102 0V5.842l4.242-2.121a1 1 0 001.11-1.664L9.64 3.5 11 3z" />
                    </svg>
                </NavItem>
                <NavItem label="AI" onClick={onAiClick} isActive={isAiActive}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 2a.5.5 0 01.5.5V3a2 2 0 012 2v1a1 1 0 01-1 1H4a1 1 0 01-1-1V5a2 2 0 012-2h.5a.5.5 0 01.5-.5zM6 6h2V5a1 1 0 00-1-1H7v2zm-3 2a.5.5 0 000 1h10a.5.5 0 000-1H3zM3.82 10.122A1.5 1.5 0 003 11.5v1a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-1a1.5 1.5 0 00-2.357-1.029l-.28.175A.5.5 0 013.82 10.122zm8.36 0a.5.5 0 01.176.702l-.28.467A1.5 1.5 0 0011 12.5v1a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-1a1.5 1.5 0 00-1.143-1.47l-.28-.176a.5.5 0 01.176-.702zM11 14.5a1.5 1.5 0 01-1.5 1.5h-1A1.5 1.5 0 017 14.5v-1a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1z" clipRule="evenodd" />
                    </svg>
                </NavItem>
            </div>
        </nav>
    );
};

export default BottomNavBar;