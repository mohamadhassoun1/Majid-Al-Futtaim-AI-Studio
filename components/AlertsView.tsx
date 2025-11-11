import React from 'react';
import { Item, Status } from '../types';
import { getStatus } from '../utils/statusHelper';
import ItemCard from './ItemCard';

interface AlertsViewProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

const AlertsView: React.FC<AlertsViewProps> = ({ items, onEdit, onDelete }) => {
    const expiringSoonItems = items.filter(item => getStatus(item.expirationDate) === Status.ExpiringSoon)
        .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
        
    const expiredItems = items.filter(item => getStatus(item.expirationDate) === Status.Expired)
        .sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime());
    
    const allAlerts = [...expiredItems, ...expiringSoonItems];

    return (
        <section className="animate-fade-in">
            <h2 className="text-xl font-bold text-text-dark mb-4">Notifications</h2>
            {allAlerts.length > 0 ? (
                <div className="space-y-6">
                    {expiredItems.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-status-expired mb-2 px-1">Expired</h3>
                            <div className="space-y-3">
                                {expiredItems.map(item => (
                                    <ItemCard key={item.itemId} item={item} onEdit={onEdit} onDelete={onDelete} />
                                ))}
                            </div>
                        </div>
                    )}
                    {expiringSoonItems.length > 0 && (
                         <div>
                            <h3 className="text-sm font-semibold text-status-soon mb-2 px-1">Expiring Soon</h3>
                            <div className="space-y-3">
                                {expiringSoonItems.map(item => (
                                    <ItemCard key={item.itemId} item={item} onEdit={onEdit} onDelete={onDelete} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-text-light text-sm">You have no new alerts.</p>
                </div>
            )}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default AlertsView;
