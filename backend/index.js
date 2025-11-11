
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// --- HELPER FUNCTIONS ---
const generateAccessCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// --- DATABASE INITIALIZATION ---
const initializeDb = async () => {
  try {
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS Stores (
        storeCode VARCHAR(50) PRIMARY KEY,
        storeName VARCHAR(255) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS Staff (
        staffId VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        storeId VARCHAR(50) REFERENCES Stores(storeCode)
      );
      CREATE TABLE IF NOT EXISTS AccessCodes (
        code VARCHAR(50) PRIMARY KEY,
        staffId VARCHAR(100) REFERENCES Staff(staffId) ON DELETE CASCADE,
        createdAt BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS Items (
        itemId VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        expirationDate DATE NOT NULL,
        quantity INTEGER NOT NULL,
        imageUrl TEXT,
        addedByStaffId VARCHAR(100) REFERENCES Staff(staffId),
        storeCode VARCHAR(50) REFERENCES Stores(storeCode)
      );
    `;
    await pool.query(createTablesQuery);
    console.log('Database tables are ready.');

    // One-time: Populate stores if the table is empty
    const res = await pool.query('SELECT COUNT(*) FROM Stores');
    if (res.rows[0].count === '0') {
        console.log('Stores table is empty, populating with initial data...');
        const storesData = [
            { code: "C42", name: "CN AE DUB 15 NORTH SIDE B.BAY" }, { code: "C16", name: "CT UAE DXB DUJA TOWER" }, { code: "818", name: "SHA Al Fardan" }, { code: "834", name: "SHA Nasseria" }, { code: "870", name: "SHJ AL ZAHIA HUB" }, { code: "875", name: "DXB LIVING LEGENDS" }, { code: "823", name: "UAQ Umm Al Quwain" }, { code: "C34", name: "Refraction Tower" }, { code: "872", name: "MOBIMART BUS" }, { code: "855", name: "RAK Al Dhait" }, { code: "844", name: "DUB First Avenue" }, { code: "814", name: "DUB JLT Palladium" }, { code: "829", name: "ABD Al Raha Beach" }, { code: "882", name: "SM UAE ABD MBZ" }, { code: "862", name: "DUB NSHAMA" }, { code: "827", name: "SHA Mirgab" }, { code: "C45", name: "CN AE ABD AL RAHA CANAL" }, { code: "C15", name: "HYDRA" }, { code: "868", name: "Jumirah Park Club House" }, { code: "838", name: "DUB Tecom I-Rise" }, { code: "C53", name: "CN AE DXB BURJ AL SALAM" }, { code: "854", name: "DUB JBR Rimal" }, { code: "C12", name: "EMIRATES TOWER 7" }, { code: "812", name: "DUB Tecom Vista" }, { code: "840", name: "DUB Ranches 2 Souq" }, { code: "014", name: "ABD Dalma Mall" }, { code: "061", name: "ABD Deerfield" }, { code: "009", name: "DUB Shindagha" }, { code: "072", name: "DUB Festival City" }, { code: "005", name: "RAK Manar Mall" }, { code: "071", name: "Al Reem Mall" }, { code: "016", name: "ABD Baniyas" }, { code: "851", name: "DUB Discovery" }, { code: "067", name: "ABD Masdar MAFP" }, { code: "008", name: "SHA Sharjah City Ctr" }, { code: "874", name: "water edge" }, { code: "849", name: "ABD Paragon" }, { code: "069", name: "AJM AL MURAD MALL" }, { code: "012", name: "AIN Al Bawadi Mall" }, { code: "837", name: "DUB Wasl Road" }, { code: "073", name: "DUB Ibn Batuta" }, { code: "074", name: "ABD Yas Island" }, { code: "003", name: "DUB Deira City Ctr" }, { code: "064", name: "DUB Meaisem City Center" }, { code: "006", name: "ABD Marina Mall" }, { code: "015", name: "DUB Mirdif City Ctr" }, { code: "865", name: "ABD AL ZEINA" }, { code: "845", name: "DUB Ranches 1 Village" }, { code: "004", name: "ABD Airport Rd Saqr" }, { code: "066", name: "DUB City Land" }, { code: "070", name: "SHJ AL ZAHIA MALL" }, { code: "011", name: "DUB MOE" }, { code: "007", name: "AIN Al Jimmy Mall" }, { code: "C26", name: "Gate Avenue DIFC" }, { code: "805", name: "DUB Oasis Center" }, { code: "866", name: "DXB MIRDIFF HILIS" }, { code: "876", name: "Avenue Mall Nadd Al Shiba" }, { code: "881", name: "SM AE DUB Green Views" }, { code: "831", name: "DUB DIP" }, { code: "C40", name: "CN AE DUB Binghatti Creek" }, { code: "C33", name: "MAYAN" }, { code: "C38", name: "CT UAE DXB SOCIO PARK" }, { code: "879", name: "SM UAE DXB MIDTOWN BY DYAR" }, { code: "C20", name: "IBIS TOWER" }, { code: "821", name: "SHA Al Quoz" }, { code: "884", name: "SM UAE DXB AMWAJ" }, { code: "C27", name: "Tower 9" }, { code: "867", name: "ABD GARDEN PLAZA" }, { code: "843", name: "DUB MCC Science Park" }, { code: "826", name: "SHA Al Juraina" }, { code: "825", name: "DUB Marina Silvarene" }, { code: "077", name: "HM UAE ABD AL MAFRAQ" }, { code: "860", name: "DUB Marina Gate" }, { code: "850", name: "DUB Jum Park" }, { code: "878", name: "Carrefour Market Tilal Al Ghaf" }, { code: "060", name: "FUJ Fujairah City Ctr" }, { code: "019", name: "DUB Madina Mall" }, { code: "C24", name: "Damac Prive" }, { code: "C09", name: "Bunyan store" }, { code: "017", name: "RAK Al Naeem City Ctr" }, { code: "C50", name: "CN AE DUB DWTC" }, { code: "833", name: "ABD Al Seef" }, { code: "065", name: "AIN Al Ain Mall" }, { code: "824", name: "DUB Burj Views" }, { code: "018", name: "FUJ Safeer Fujairah" }, { code: "C49", name: "CN AE DUB JEWEL" }, { code: "D03", name: "MFC UAE Dubai" }, { code: "815", name: "DUB Marina Crown" }, { code: "885", name: "SM UAE DXB ALAREESH DFC" }, { code: "863", name: "SM AE DUB Akoya Oxygen" }, { code: "853", name: "DUB ReemRam" }, { code: "062", name: "DUB Burjuman" }, { code: "877", name: "Carrefour Amsaf (Super Market)" }, { code: "842", name: "DUB DSO Souq Extra" }, { code: "002", name: "AJM Ajman City Ctr" }, { code: "C48", name: "CN AE DUB JLT ME DO RE TOWR" }, { code: "856", name: "DUB Sunset Mall" }, { code: "857", name: "DUB Springs Souq" }, { code: "852", name: "DUB Goroob" }, { code: "880", name: "SM UAE SHA AL JADA" },
        ];
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const store of storesData) {
                await client.query('INSERT INTO Stores (storeCode, storeName) VALUES ($1, $2)', [store.code, store.name]);
            }
            await client.query('COMMIT');
            console.log('Successfully populated stores table.');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// --- API ENDPOINTS ---

app.post('/login', async (req, res) => {
  const { role, credential } = req.body;
  if (!role || !credential) {
    return res.status(400).json({ error: 'Role and credential are required.' });
  }

  try {
    if (role === 'admin') {
      if (credential === process.env.ADMIN_PASSWORD) {
        res.json({ role: 'admin', staffId: 'admin_user', name: 'Admin' });
      } else {
        res.status(401).json({ error: 'Invalid admin password.' });
      }
    } else if (role === 'staff') {
      const codeResult = await pool.query('SELECT * FROM AccessCodes WHERE code = $1', [credential.toUpperCase()]);
      if (codeResult.rows.length > 0) {
        const foundCode = codeResult.rows[0];
        const staffResult = await pool.query('SELECT * FROM Staff WHERE staffId = $1', [foundCode.staffid]);
        if (staffResult.rows.length > 0) {
          const staffMember = staffResult.rows[0];
          res.json({
            role: 'staff',
            staffId: staffMember.staffid,
            storeId: staffMember.storeid,
            name: staffMember.name,
          });
        } else {
           res.status(404).json({ error: 'Staff member not found for this code.' });
        }
      } else {
        res.status(401).json({ error: 'Invalid access code.' });
      }
    } else {
      res.status(400).json({ error: 'Invalid role specified.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

app.get('/data/all', async (req, res) => {
    // A real app should protect this route, e.g., with a token check
    try {
        const [itemsRes, staffRes, accessCodesRes, storesRes] = await Promise.all([
            pool.query('SELECT * FROM Items ORDER BY expirationDate ASC'),
            pool.query('SELECT * FROM Staff ORDER BY name ASC'),
            pool.query('SELECT * FROM AccessCodes ORDER BY createdAt DESC'),
            pool.query('SELECT * FROM Stores ORDER BY storeName ASC'),
        ]);
        res.json({
            items: itemsRes.rows.map(i => ({...i, itemId: i.itemid, name: i.name, category: i.category, expirationDate: i.expirationdate, quantity: i.quantity, imageUrl: i.imageurl, addedByStaffId: i.addedbystaffid, storeCode: i.storecode})),
            staff: staffRes.rows.map(s => ({...s, staffId: s.staffid, name: s.name, storeId: s.storeid})),
            accessCodes: accessCodesRes.rows.map(c => ({...c, code: c.code, staffId: c.staffid, createdAt: c.createdat})),
            stores: storesRes.rows.map(st => ({...st, storeCode: st.storecode, storeName: st.storename})),
        });
    } catch (error) {
        console.error('/data/all error:', error);
        res.status(500).json({ error: 'Failed to fetch all data.' });
    }
});

app.get('/data/store', async (req, res) => {
    const { storeCode } = req.query;
    if (!storeCode) {
        return res.status(400).json({ error: 'storeCode is required.'});
    }
    try {
         const [itemsRes, staffRes, accessCodesRes, storesRes] = await Promise.all([
            pool.query('SELECT * FROM Items WHERE storeCode = $1 ORDER BY expirationDate ASC', [storeCode]),
            pool.query('SELECT * FROM Staff ORDER BY name ASC'), // Global staff/leaderboard data
            pool.query('SELECT * FROM AccessCodes ORDER BY createdAt DESC'), // Global data
            pool.query('SELECT * FROM Stores ORDER BY storeName ASC'), // Global data
        ]);
        res.json({
            items: itemsRes.rows.map(i => ({...i, itemId: i.itemid, name: i.name, category: i.category, expirationDate: i.expirationdate, quantity: i.quantity, imageUrl: i.imageurl, addedByStaffId: i.addedbystaffid, storeCode: i.storecode})),
            staff: staffRes.rows.map(s => ({...s, staffId: s.staffid, name: s.name, storeId: s.storeid})),
            accessCodes: accessCodesRes.rows.map(c => ({...c, code: c.code, staffId: c.staffid, createdAt: c.createdat})),
            stores: storesRes.rows.map(st => ({...st, storeCode: st.storecode, storeName: st.storename})),
        });
    } catch (error) {
        console.error('/data/store error:', error);
        res.status(500).json({ error: 'Failed to fetch store data.' });
    }
});


app.post('/items', async (req, res) => {
    const { name, expirationDate, category, quantity, imageUrl, staffId, storeCode } = req.body;
    // In a real app, staffId and storeCode would be derived from a secure token, not trusted from the client.
    if (!name || !expirationDate || !quantity || !staffId || !storeCode) {
        return res.status(400).json({ error: 'Missing required item fields.' });
    }
    try {
        const itemId = `item_${Date.now()}`;
        const query = `
            INSERT INTO Items (itemId, name, category, expirationDate, quantity, imageUrl, addedByStaffId, storeCode)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const result = await pool.query(query, [itemId, name, category, expirationDate, quantity, imageUrl, staffId, storeCode]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item.' });
    }
});

app.post('/admin/staff', async (req, res) => {
    const { storeCode, staffId: staffIdInput } = req.body;
    if (!storeCode) {
        return res.status(400).json({ error: 'storeCode is required.' });
    }

    const client = await pool.connect();
    try {
        const newStaffId = staffIdInput.trim() || `staff_${Date.now()}`;
        
        // Check if staff ID already exists
        const staffExists = await client.query('SELECT 1 FROM Staff WHERE staffId = $1', [newStaffId]);
        if(staffExists.rows.length > 0) {
            return res.status(409).json({ error: 'Staff ID already exists.' });
        }

        const newCode = generateAccessCode();

        await client.query('BEGIN');
        
        // Insert into Staff table
        const staffQuery = 'INSERT INTO Staff (staffId, storeId, name) VALUES ($1, $2, $3)';
        await client.query(staffQuery, [newStaffId, storeCode, newStaffId]);
        
        // Insert into AccessCodes table
        const codeQuery = 'INSERT INTO AccessCodes (code, staffId, createdAt) VALUES ($1, $2, $3)';
        await client.query(codeQuery, [newCode, newStaffId, Date.now()]);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: `Successfully created staff ${newStaffId}`,
            accessCode: newCode,
            staffId: newStaffId,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding staff and code:', error);
        res.status(500).json({ error: 'Failed to add staff and code.' });
    } finally {
        client.release();
    }
});

// A simple AI endpoint that protects the API Key
app.post('/ai/ask', async (req, res) => {
    const { query, itemContext, systemInstruction } = req.body;
    if (!query || !systemInstruction) {
        return res.status(400).json({ error: 'Query and systemInstruction are required.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const fullPrompt = `${systemInstruction}\n\nInventory Data:\n${itemContext}\n\nUser Query: ${query}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: fullPrompt,
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error("Backend Gemini API Error:", error);
        res.status(500).json({ error: 'An error occurred while processing your request with the AI assistant.' });
    }
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeDb();
});
