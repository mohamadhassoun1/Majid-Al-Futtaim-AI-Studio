import React from 'react';

interface DashboardHeaderProps {
    userName: string;
    storeName: string;
    onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, storeName, onMenuClick }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <p className="text-xl font-bold text-text-dark">Hello, {userName}</p>
            <p className="text-sm text-text-light">{storeName} Overview</p>
        </div>
        <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>
);

export default DashboardHeader;