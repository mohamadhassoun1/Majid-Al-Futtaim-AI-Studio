import { Item, Status } from '../types';

export const getDaysRemaining = (expirationDateStr: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const [year, month, day] = expirationDateStr.split('-').map(Number);
    const expirationDate = new Date(year, month - 1, day);
    expirationDate.setHours(0, 0, 0, 0);

    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const getStatus = (expirationDateStr: string): Status => {
    const daysRemaining = getDaysRemaining(expirationDateStr);
    
    if (daysRemaining < 0) {
        return Status.Expired;
    }
    // 'Expiring Soon' is for items expiring within the next 7 days (inclusive of today).
    if (daysRemaining <= 7) {
        return Status.ExpiringSoon;
    }

    return Status.Active;
};

// New function to calculate score based on activity (items added)
export const calculateActivityScore = (allItems: Item[], staffId: string): number => {
    if (!allItems || !staffId) {
        return 0;
    }
    // Score is the number of items added by this staff member
    return allItems.filter(item => item.addedByStaffId === staffId).length;
};