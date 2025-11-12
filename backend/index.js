
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

app.use(express.json());

// --- IN-MEMORY DATA STORE ---
const storesData = [
    { code: "C42", name: "CN AE DUB 15 NORTH SIDE B.BAY" }, { code: "C16", name: "CT UAE DXB DUJA TOWER" }, { code: "818", name: "SHA Al Fardan" }, { code: "834", name: "SHA Nasseria" }, { code: "870", name: "SHJ AL ZAHIA HUB" }, { code: "875", name: "DXB LIVING LEGENDS" }, { code: "823", name: "UAQ Umm Al Quwain" }, { code: "C34", name: "Refraction Tower" }, { code: "872", name: "MOBIMART BUS" }, { code: "855", name: "RAK Al Dhait" }, { code: "844", name: "DUB First Avenue" }, { code: "814", name: "DUB JLT Palladium" }, { code: "829", name: "ABD Al Raha Beach" }, { code: "882", name: "SM UAE ABD MBZ" }, { code: "862", name: "DUB NSHAMA" }, { code: "827", name: "SHA Mirgab" }, { code: "C45", name: "CN AE ABD AL RAHA CANAL" }, { code: "C15", name: "HYDRA" }, { code: "868", name: "Jumirah Park Club House" }, { code: "838", name: "DUB Tecom I-Rise" }, { code: "C53", name: "CN AE DXB BURJ AL SALAM" }, { code: "854", name: "DUB JBR Rimal" }, { code: "C12", name: "EMIRATES TOWER 7" }, { code: "812", name: "DUB Tecom Vista" }, { code: "840", name: "DUB Ranches 2 Souq" }, { code: "014", name: "ABD Dalma Mall" }, { code: "061", name: "ABD Deerfield" }, { code: "009", name: "DUB Shindagha" }, { code: "072", name: "DUB Festival City" }, { code: "005", name: "RAK Manar Mall" }, { code: "071", name: "Al Reem Mall" }, { code: "016", name: "ABD Baniyas" }, { code: "851", name: "DUB Discovery" }, { code: "067", name: "ABD Masdar MAFP" }, { code: "008", name: "SHA Sharjah City Ctr" }, { code: "874", name: "water edge" }, { code: "849", name: "ABD Paragon" }, { code: "069", name: "AJM AL MURAD MALL" }, { code: "012", name: "AIN Al Bawadi Mall" }, { code: "837", name: "DUB Wasl Road" }, { code: "073", name: "DUB Ibn Batuta" }, { code: "074", name: "ABD Yas Island" }, { code: "003", name: "DUB Deira City Ctr" }, { code: "064", name: "DUB Meaisem City Center" }, { code: "006", name: "ABD Marina Mall" }, { code: "015", name: "DUB Mirdif City Ctr" }, { code: "865", name: "ABD AL ZEINA" }, { code: "845", name: "DUB Ranches 1 Village" }, { code: "004", name: "ABD Airport Rd Saqr" }, { code: "066", name: "DUB City Land" }, { code: "070", name: "SHJ AL ZAHIA MALL" }, { code: "011", name: "DUB MOE" }, { code: "007", name: "AIN Al Jimmy Mall" }, { code: "C26", name: "Gate Avenue DIFC" }, { code: "805", name: "DUB Oasis Center" }, { code: "866", name: "DXB MIRDIFF HILIS" }, { code: "876", name: "Avenue Mall Nadd Al Shiba" }, { code: "881", name: "SM AE DUB Green Views" }, { code: "831", name: "DUB DIP" }, { code: "C40", name: "CN AE DUB Binghatti Creek" }, { code: "C33", name: "MAYAN" }, { code: "C38", name: "CT UAE DXB SOCIO PARK" }, { code: "879", name: "SM UAE DXB MIDTOWN BY DYAR" }, { code: "C20", name: "IBIS TOWER" }, { code: "821", name: "SHA Al Quoz" }, { code: "884", name: "SM UAE DXB AMWAJ" }, { code: "C27", name: "Tower 9" }, { code: "867", name: "ABD GARDEN PLAZA" }, { code: "843", name: "DUB MCC Science Park" }, { code: "826", name: "SHA Al Juraina" }, { code: "825", name: "DUB Marina Silvarene" }, { code: "077", name: "HM UAE ABD AL MAFRAQ" }, { code: "860", name: "DUB Marina Gate" }, { code: "850", name: "DUB Jum Park" }, { code: "878", name: "Carrefour Market Tilal Al Ghaf" }, { code: "060", name: "FUJ Fujairah City Ctr" }, { code: "019", name: "DUB Madina Mall" }, { code: "C24", name: "Damac Prive" }, { code: "C09", name: "Bunyan store" }, { code: "017", name: "RAK Al Naeem City Ctr" }, { code: "C50", name: "CN AE DUB DWTC" }, { code: "833", name: "ABD Al Seef" }, { code: "065", name: "AIN Al Ain Mall" }, { code: "824", name: "DUB Burj Views" }, { code: "018", name: "FUJ Safeer Fujairah" }, { code: "C49", name: "CN AE DUB JEWEL" }, { code: "D03", name: "MFC UAE Dubai" }, { code: "815", name: "DUB Marina Crown" }, { code: "885", name: "SM UAE DXB ALAREESH DFC" }, { code: "863", name: "SM AE DUB Akoya Oxygen" }, { code: "853", name: "DUB ReemRam" }, { code: "062", name: "DUB Burjuman" }, { code: "877", name: "Carrefour Amsaf (Super Market)" }, { code: "842", name: "DUB DSO Souq Extra" }, { code: "002", name: "AJM Ajman City Ctr" }, { code: "C48", name: "CN AE DUB JLT ME DO RE TOWR" }, { code: "856", name: "DUB Sunset Mall" }, { code: "857", name: "DUB Springs Souq" }, { code: "852", name: "DUB Goroob" }, { code: "880", name: "SM UAE SHA AL JADA" },
];
let stores = [];
let staff = [];
let accessCodes = [];
let items = [];

// --- HELPER FUNCTIONS ---
const generateAccessCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// --- AUTHENTICATION MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(401).json({ error: 'Authentication credential is required.' });
    }

    if (credential === 'mohamadhassoun012@gmail.com') {
        req.user = { role: 'admin', staffId: 'admin_user', name: 'Admin' };
        return next();
    }

    const code = accessCodes.find(c => c.code === credential.toUpperCase());
    if (code) {
        const staffMember = staff.find(s => s.staffId === code.staffId);
        if (staffMember) {
            req.user = {
                role: 'staff',
                staffId: staffMember.staffId,
                storeId: staffMember.storeId,
                name: staffMember.name
            };
            return next();
        }
    }

    return res.status(401).json({ error: 'Invalid authentication credential.' });
};

// --- DATA INITIALIZATION ---
const initializeData = () => {
  stores = storesData.map(s => ({...s})); // Make a copy
  
  // Create some mock data for demonstration
  if (staff.length === 0) {
    const initialStaffId = 'staff_initial';
    const initialStoreCode = 'C42';
    staff.push({
        staffId: initialStaffId,
        name: initialStaffId,
        storeId: initialStoreCode,
    });
    const initialCode = 'ABCDE';
    accessCodes.push({
        code: initialCode,
        staffId: initialStaffId,
        createdAt: Date.now(),
    });
    console.log(`Created initial staff '${initialStaffId}' for store '${initialStoreCode}' with access code '${initialCode}'`);
    
    const today = new Date();
    const expiringSoonDate = new Date();
    expiringSoonDate.setDate(today.getDate() + 5);
    const expiredDate = new Date();
    expiredDate.setDate(today.getDate() - 2);
    const activeDate = new Date();
    activeDate.setDate(today.getDate() + 10);
    const toYYYYMMDD = (d) => d.toISOString().split('T')[0];

    items.push({
        itemId: 'item_1', name: 'Milk', category: 'Dairy', expirationDate: toYYYYMMDD(expiringSoonDate),
        quantity: 2, imageUrl: '', addedByStaffId: initialStaffId, storeCode: initialStoreCode
    });
    items.push({
        itemId: 'item_2', name: 'Bread', category: 'Bakery', expirationDate: toYYYYMMDD(expiredDate),
        quantity: 1, imageUrl: '', addedByStaffId: initialStaffId, storeCode: initialStoreCode
    });
    items.push({
        itemId: 'item_3', name: 'Cheese', category: 'Dairy', expirationDate: toYYYYMMDD(activeDate),
        quantity: 5, imageUrl: '', addedByStaffId: initialStaffId, storeCode: 'C16'
    });
    console.log('Added 3 initial items.');
  }
  
  console.log('In-memory data store initialized.');
};


// --- API ENDPOINTS ---

// PUBLIC ENDPOINTS
app.post('/login', (req, res) => {
  const { role, credential } = req.body;
  if (!role || !credential) return res.status(400).json({ error: 'Role and credential are required.' });
  
  if (role === 'admin') {
    if (credential === 'mohamadhassoun012@gmail.com') {
      return res.json({ role: 'admin', staffId: 'admin_user', name: 'Admin', credential });
    }
    return res.status(401).json({ error: 'Invalid admin password.' });
  }

  const code = accessCodes.find(c => c.code === credential.toUpperCase());
  if (code) {
    const staffMember = staff.find(s => s.staffId === code.staffId);
    if (staffMember) {
      return res.json({
        role: 'staff',
        staffId: staffMember.staffId,
        storeId: staffMember.storeId,
        name: staffMember.name,
        credential,
      });
    }
  }
  return res.status(401).json({ error: 'Invalid access code.' });
});

app.get('/data/all', (req, res) => {
    const mappedAccessCodes = accessCodes.map(c => {
        const s = staff.find(st => st.staffId === c.staffId);
        return { ...c, storeCode: s ? s.storeId : 'N/A' };
    });
    res.json({
        items: [...items].sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate)),
        staff: [...staff].sort((a,b) => a.name.localeCompare(b.name)),
        accessCodes: mappedAccessCodes.sort((a,b) => b.createdAt - a.createdAt),
        stores: [...stores].sort((a,b) => a.name.localeCompare(b.name)),
    });
});

app.get('/data/store', (req, res) => {
    const { storeCode } = req.query;
    if (!storeCode) return res.status(400).json({ error: 'storeCode is required.'});
    
    const storeItems = items.filter(i => i.storeCode === storeCode);
    const mappedAccessCodes = accessCodes.map(c => {
        const s = staff.find(st => st.staffId === c.staffId);
        return { ...c, storeCode: s ? s.storeId : 'N/A' };
    });

    res.json({
        items: storeItems.sort((a,b) => new Date(a.expirationDate) - new Date(b.expirationDate)),
        staff: [...staff].sort((a,b) => a.name.localeCompare(b.name)),
        accessCodes: mappedAccessCodes.sort((a,b) => b.createdAt - a.createdAt),
        stores: [...stores].sort((a,b) => a.name.localeCompare(b.name)),
    });
});

// SECURE ENDPOINTS
app.post('/items/add', authMiddleware, (req, res) => {
    const { name, expirationDate, category, quantity, imageUrl } = req.body;
    const { staffId, storeId } = req.user;

    if (!name || !expirationDate || !quantity) return res.status(400).json({ error: 'Missing required item fields.' });
    
    const newItem = {
        itemId: `item_${Date.now()}`, name, category, expirationDate, 
        quantity: parseInt(quantity, 10), imageUrl, addedByStaffId: staffId, storeCode: storeId
    };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.put('/items/:itemId', authMiddleware, (req, res) => {
    const { itemId } = req.params;
    const { name, expirationDate, category, quantity, imageUrl } = req.body;
    if (!name || !expirationDate || !quantity ) return res.status(400).json({ error: 'Missing required fields.' });

    const itemIndex = items.findIndex(i => i.itemId === itemId);
    if (itemIndex === -1) return res.status(404).json({ error: 'Item not found.' });

    const updatedItem = {
        ...items[itemIndex],
        name, expirationDate, category, quantity: parseInt(quantity, 10), imageUrl,
    };
    items[itemIndex] = updatedItem;
    res.json(updatedItem);
});

app.post('/items/:itemId/delete', authMiddleware, (req, res) => {
    const { itemId } = req.params;
    const initialLength = items.length;
    items = items.filter(i => i.itemId !== itemId);
    if (items.length === initialLength) return res.status(404).json({ error: 'Item not found.' });
    res.status(204).send();
});

app.post('/admin/staff', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    const { storeCode, staffId: staffIdInput } = req.body;
    if (!storeCode) return res.status(400).json({ error: 'storeCode is required.' });

    const newStaffId = staffIdInput.trim() || `staff_${Date.now()}`;
    if (staff.some(s => s.staffId === newStaffId)) {
        return res.status(409).json({ error: 'Staff ID already exists.' });
    }
    
    staff.push({ staffId: newStaffId, storeId: storeCode, name: newStaffId });
    const newCode = generateAccessCode();
    accessCodes.push({ code: newCode, staffId: newStaffId, createdAt: Date.now() });

    res.status(201).json({ accessCode: newCode, staffId: newStaffId });
});

app.post('/admin/codes/:code/delete', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { code } = req.params;

    const codeToDelete = accessCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!codeToDelete) return res.status(404).json({ error: 'Access code not found.' });
    
    const staffIdToDelete = codeToDelete.staffId;
    accessCodes = accessCodes.filter(c => c.staffId !== staffIdToDelete);
    staff = staff.filter(s => s.staffId !== staffIdToDelete);
    
    res.status(204).send();
});

app.post('/ai/ask', authMiddleware, async (req, res) => {
    const { query, itemContext, systemInstruction } = req.body;
    if (!query || !systemInstruction) return res.status(400).json({ error: 'Query and systemInstruction are required.' });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Inventory Data:\n${itemContext}\n\nUser Query: ${query}`,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        res.json({ text: response.text });
    } catch (error) {
        console.error("Backend Gemini API Error:", error);
        res.status(500).json({ error: 'An error occurred with the AI assistant.' });
    }
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeData();
});
