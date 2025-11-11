// components/StaffLeaderboard.tsx
import React, { useMemo } from 'react';
import { Item, Staff, AccessCode } from '../types';

interface StaffLeaderboardProps {
  allItems: Item[];
  staffList: Staff[];
  accessCodes: AccessCode[];
  stores: { code: string, name: string }[];
}

const StaffLeaderboard: React.FC<StaffLeaderboardProps> = ({ allItems, staffList, accessCodes, stores }) => {
  const leaderboard = useMemo(() => {
    const allItemsList = allItems;
    const allStaff = staffList;
    
    const staffCreationDates = new Map<string, number>();
    accessCodes.forEach(code => {
        const existingTimestamp = staffCreationDates.get(code.staffId);
        if (!existingTimestamp || code.createdAt < existingTimestamp) {
            staffCreationDates.set(code.staffId, code.createdAt);
        }
    });

    const data = allStaff.map(staff => {
      const score = allItemsList.filter((item: Item) => item.addedByStaffId === staff.staffId).length;
      const store = stores.find(s => s.code === staff.storeId);
      const storeName = store ? store.name : `Unknown Store (${staff.storeId})`;
      const createdAt = staffCreationDates.get(staff.staffId) || 0;
      return { staffId: staff.staffId, storeId: staff.storeId, storeName, score, createdAt };
    });

    data.sort((a, b) => b.score - a.score);
    return data;
  }, [allItems, staffList, accessCodes, stores]);

  const handleExportCSV = () => {
    if (leaderboard.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ['Staff ID', 'Store Name', 'Items Added'];
    const csvRows = [
      headers.join(','),
      ...leaderboard.map(row => 
        [
          `"${row.staffId}"`,
          `"${row.storeName.replace(/"/g, '""')}"`, // Escape double quotes
          row.score
        ].join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'staff_leaderboard_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-dark">Staff Leaderboard</h2>
        <button
            onClick={handleExportCSV}
            className="bg-primary text-white font-semibold py-1 px-3 rounded-md text-sm hover:bg-primary-dark transition-colors"
        >
            Export as CSV
        </button>
      </div>
      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
            const isNew = entry.createdAt > 0 && (Date.now() - entry.createdAt) < 7 * 24 * 60 * 60 * 1000;
            const isTop3 = index < 3;
            const is100Plus = entry.score >= 100;

            return (
              <div key={`${entry.staffId}-${index}`} className="p-4 rounded-lg shadow-sm flex items-center space-x-4 bg-blue-50 border border-primary/20">
                <div className="text-2xl font-bold w-10 text-center flex-shrink-0 text-primary/70">#{index + 1}</div>
                <div className="flex-grow">
                  <p className="font-bold text-xs text-text-dark tracking-wide">STAFF ID:</p>
                  <div className="flex items-center gap-x-2">
                    <p className="font-extrabold text-2xl text-text-dark leading-tight">{entry.staffId}</p>
                    <div className="flex items-center gap-x-1">
                        {isNew && <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-[#4CAF50]">NEW</span>}
                        {isTop3 && <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-[#2196F3]">TOP 3</span>}
                        {is100Plus && <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-[#FF9800]">100+</span>}
                    </div>
                  </div>
                  <div className="text-xs text-text-light mt-1 leading-tight break-words">{entry.storeName}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-2xl text-primary">{entry.score}</p>
                  <p className="text-xs text-text-light">Items Added</p>
                </div>
              </div>
            )
        })}
      </div>
      <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default StaffLeaderboard;