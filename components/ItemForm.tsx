import React, { useState, useEffect, useRef } from 'react';
import { Item } from '../types';
import BarcodeScanner from './BarcodeScanner';

const mockFetchItemData = (barcode: string): Promise<{ name: string; imageUrl: string } | null> => {
    console.log(`Searching for barcode: ${barcode}`);
    const productDatabase: { [key: string]: { name: string; imageUrl: string } } = {
        '8901030703819': { name: 'Parle-G Gold Biscuits', imageUrl: 'https://i.imgur.com/RE2dG3g.jpeg' },
        '073360230238': { name: 'Jif Creamy Peanut Butter', imageUrl: 'https://i.imgur.com/k9b2s8Q.jpeg' },
        '049000050103': { name: 'Coca-Cola Classic', imageUrl: 'https://i.imgur.com/8Q6Sg2E.jpeg' },
    };
    return new Promise(resolve => setTimeout(() => resolve(productDatabase[barcode] || null), 500));
};

interface ItemFormProps {
  onClose: () => void;
  onAddItem: (item: Omit<Item, 'itemId'>) => void;
  onUpdateItem: (item: Item) => void;
  initialData: Partial<Item> | null;
}

const QuantityStepper: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center justify-center space-x-4">
    <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="w-10 h-10 rounded-full bg-gray-200 text-2xl font-bold text-text-light transition hover:bg-gray-300">-</button>
    <span className="text-3xl font-bold w-12 text-center">{value}</span>
    <button type="button" onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-full bg-gray-200 text-2xl font-bold text-text-light transition hover:bg-gray-300">+</button>
  </div>
);


const ItemForm: React.FC<ItemFormProps> = ({ onClose, onAddItem, onUpdateItem, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notificationDays: 15,
    quantity: 1,
    imageUrl: '',
  });
  const [barcode, setBarcode] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = initialData && 'itemId' in initialData && !!initialData.itemId;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        expirationDate: initialData.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notificationDays: initialData.notificationDays || 15,
        quantity: initialData.quantity || 1,
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData]);
  
  const handleBarcodeLookup = async (code: string) => {
    if (!code) return;
    const itemData = await mockFetchItemData(code);
    if (itemData) {
        setFormData(prev => ({ ...prev, name: itemData.name, imageUrl: itemData.imageUrl, category: 'Scanned' }));
    } else {
        alert('Product not found. Please enter details manually.');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setIsScannerOpen(false);
    setBarcode(decodedText);
    handleBarcodeLookup(decodedText);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'notificationDays' || name === 'quantity' ? parseInt(value) : value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleQuantityChange = (newValue: number) => {
    setFormData(prev => ({ ...prev, quantity: newValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onUpdateItem({ ...initialData, ...formData } as Item);
    } else {
      onAddItem(formData as Omit<Item, 'itemId'>);
    }
    onClose();
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div 
                    className="w-24 h-24 object-contain mx-auto rounded-lg bg-gray-100 p-1 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt={formData.name || 'Item'} className="w-full h-full object-contain rounded-md" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

              <h2 className="text-2xl font-bold text-center text-text-dark">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
              
              <div>
                <label htmlFor="barcode" className="sr-only">Barcode</label>
                <div className="relative">
                    <input 
                    type="text" 
                    name="barcode" 
                    id="barcode" 
                    placeholder="Enter or Scan Barcode" 
                    value={barcode} 
                    onChange={(e) => setBarcode(e.target.value)} 
                    onBlur={() => handleBarcodeLookup(barcode)}
                    className="w-full px-4 py-3 border border-border-color bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                    />
                    <button 
                    type="button" 
                    onClick={() => setIsScannerOpen(true)} 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary"
                    aria-label="Scan Barcode"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" /></svg>
                    </button>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="sr-only">Item Name</label>
                <input type="text" name="name" id="name" placeholder="Item Name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-border-color bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              <div className="flex items-center space-x-3">
                <label htmlFor="expirationDate" className="text-sm font-medium text-text-light">Expires:</label>
                <input type="date" name="expirationDate" id="expirationDate" value={formData.expirationDate} onChange={handleChange} required className="flex-grow px-4 py-3 border border-border-color bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              <div className="text-center space-y-2">
                  <label className="text-sm font-medium text-text-light">Quantity</label>
                  <QuantityStepper value={formData.quantity} onChange={handleQuantityChange} />
              </div>
            </div>

            <div className="flex bg-gray-50 p-4 rounded-b-2xl">
              <button type="button" onClick={onClose} className="w-full text-center font-semibold text-text-light py-3 px-4 rounded-lg hover:bg-gray-200 transition">Cancel</button>
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition">{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
        <style>{`
          @keyframes slide-up {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up {
              animation: slide-up 0.3s ease-out forwards;
          }
      `}</style>
      </div>
      {isScannerOpen && <BarcodeScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />}
    </>
  );
};

export default ItemForm;
