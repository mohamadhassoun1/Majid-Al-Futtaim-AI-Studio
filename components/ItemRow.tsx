import React from 'react';
import { Item, Status } from '../types';
import { getDaysRemaining, getStatus } from '../utils/statusHelper';

interface ProgressBarProps {
  daysRemaining: number;
  status: Status;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ daysRemaining, status }) => {
  const totalDays = 30; // Assume a 30-day "freshness" window for visualization
  const progress = Math.max(0, (daysRemaining / totalDays) * 100);

  const colorClasses: Record<Status, string> = {
    [Status.Active]: 'bg-status-good',
    [Status.ExpiringSoon]: 'bg-status-warning',
    [Status.Expired]: 'bg-status-danger',
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
      <div
        className={`h-1.5 rounded-full ${colorClasses[status]}`}
        style={{ width: `${status === Status.Expired ? 100 : progress}%` }}
      ></div>
    </div>
  );
};

interface ItemRowProps {
  item: Item;
  onEdit: (item: Item) => void;
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onEdit, isEditMode, isSelected, onSelect }) => {
  const daysRemaining = getDaysRemaining(item.expirationDate);
  const status = getStatus(item.expirationDate);

  const statusText: Record<Status, string> = {
      [Status.Active]: `${daysRemaining} days left`,
      [Status.ExpiringSoon]: `Expires in ${daysRemaining} days`,
      [Status.Expired]: `Expired ${Math.abs(daysRemaining)} days ago`,
  }
  
  if (daysRemaining === 0) statusText[Status.ExpiringSoon] = 'Expires today';
  if (daysRemaining < 0 && Math.abs(daysRemaining) === 1) statusText[Status.Expired] = 'Expired yesterday';

  const handleClick = () => {
      if(isEditMode) {
          onSelect(item.itemId);
      } else {
          onEdit(item);
      }
  }

  return (
    <div 
        onClick={handleClick}
        className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 cursor-pointer ${isSelected ? 'bg-green-100 ring-2 ring-brand-accent' : 'bg-gray-50 hover:bg-gray-100'}`}
    >
      {isEditMode && (
          <div className="flex items-center justify-center">
            <input 
                type="checkbox" 
                readOnly
                checked={isSelected}
                className="h-5 w-5 rounded-full border-gray-300 text-brand-accent focus:ring-brand-accent cursor-pointer"
            />
          </div>
      )}
      <img
        src={item.imageUrl || `https://via.placeholder.com/100x100.png?text=${item.name.charAt(0)}`}
        alt={item.name}
        className="w-14 h-14 rounded-lg object-contain bg-white p-1 flex-shrink-0"
      />
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold text-text-dark truncate">{item.name}</p>
        <p className="text-sm text-text-light">Qty: {item.quantity}</p>
        <ProgressBar daysRemaining={daysRemaining} status={status} />
        <p className="text-xs text-text-light mt-1">{statusText[status]}</p>
      </div>
    </div>
  );
};

export default ItemRow;
