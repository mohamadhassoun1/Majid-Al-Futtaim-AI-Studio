import React from 'react';
import { Item, Status } from '../types';
import { getDaysRemaining, getStatus } from '../utils/statusHelper';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<Status, { borderColor: string; icon: React.ReactElement; textColor: string; }> = {
  [Status.Active]: {
    borderColor: 'border-status-active',
    textColor: 'text-status-active',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
  },
  [Status.ExpiringSoon]: {
    borderColor: 'border-status-soon',
    textColor: 'text-status-soon',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 01-1-1V6z" clipRule="evenodd" /></svg>
  },
  [Status.Expired]: {
    borderColor: 'border-status-expired',
    textColor: 'text-status-expired',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
  },
};


const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  const status = getStatus(item.expirationDate);
  const config = statusConfig[status];
  const daysRemaining = getDaysRemaining(item.expirationDate);

  const CountdownBadge = () => {
    if (status === Status.Expired) return null;

    let text: string;
    let color: string;

    if (daysRemaining === 0) {
        text = 'Due today';
        color = 'bg-status-expired text-white';
    } else if (daysRemaining <= 7) {
        text = `Due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`;
        color = 'bg-status-soon text-white';
    } else {
        text = `Expires in ${daysRemaining} days`;
        color = 'bg-status-active text-white';
    }

    return (
        <span className={`ml-2 inline-flex items-center px-2 text-xs font-bold rounded-full ${color}`} style={{ height: '16px' }}>
            {text}
        </span>
    );
  };


  return (
    <div className={`rounded-lg p-4 shadow-sm bg-white border border-gray-100 border-l-4 ${config.borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-text-dark">{item.name}</h3>
          <p className="text-sm text-text-light truncate">{item.category}</p>
        </div>
        <p className={`text-xs font-semibold flex-shrink-0 ${config.textColor}`}>{status}</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className={`flex items-center space-x-2 text-sm ${config.textColor}`}>
          {config.icon}
           <div className="flex items-center">
            <span>{new Date(item.expirationDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
            <CountdownBadge />
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => onEdit(item)} className="text-text-light hover:text-primary transition p-1.5 rounded-full hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
          <button onClick={() => onDelete(item.itemId)} className="text-text-light hover:text-error transition p-1.5 rounded-full hover:bg-red-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
