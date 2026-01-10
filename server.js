import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(DIST_DIR));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const menuSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }
});

const MenuItem = mongoose.model('MenuItem', menuSchema);

const invoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerName: String,
    date: { type: String, required: true },
    items: [{
        id: String,
        name: String,
        price: Number,
        category: String,
        quantity: Number,
        customPrice: Number
    }],
    paymentMethod: { type: String, required: true },
    total: { type: Number, required: true }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Data Migration Function
async function migrateDataIfNeeded() {
    try {
        const menuCount = await MenuItem.countDocuments();
        if (menuCount === 0) {
            const menuPath = path.join(DATA_DIR, 'menu.json');
            try {
                const menuData = await fs.readFile(menuPath, 'utf-8');
                const menuItems = JSON.parse(menuData);
                if (Array.isArray(menuItems) && menuItems.length > 0) {
                    await MenuItem.insertMany(menuItems);
                    console.log('📦 Migrated Menu data to MongoDB');
                }
            } catch (e) {
                console.log('ℹ️ No local menu.json found or empty, skipping migration');
            }
        }

        const invoiceCount = await Invoice.countDocuments();
        if (invoiceCount === 0) {
            const invoicesPath = path.join(DATA_DIR, 'invoices.json');
            try {
                const invoicesData = await fs.readFile(invoicesPath, 'utf-8');
                const invoices = JSON.parse(invoicesData);
                if (Array.isArray(invoices) && invoices.length > 0) {
                    await Invoice.insertMany(invoices);
                    console.log('📦 Migrated Invoices data to MongoDB');
                }
            } catch (e) {
                console.log('ℹ️ No local invoices.json found or empty, skipping migration');
            }
        }
    } catch (error) {
        console.error('Migration error:', error);
    }
}

// Routes

// Get menu
app.get('/api/menu', async (req, res) => {
    try {
        const menu = await MenuItem.find({});
        res.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// Save menu
app.post('/api/menu', async (req, res) => {
    try {
        const menu = req.body;
        if (!Array.isArray(menu)) {
            return res.status(400).json({ error: 'Menu must be an array' });
        }

        // Replace all menu items
        await MenuItem.deleteMany({});
        if (menu.length > 0) {
            await MenuItem.insertMany(menu);
        }

        res.json({ success: true, message: 'Menu saved successfully' });
    } catch (error) {
        console.error('Error saving menu:', error);
        res.status(500).json({ error: 'Failed to save menu data' });
    }
});

// Get invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({});
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Save invoices
app.post('/api/invoices', async (req, res) => {
    try {
        const invoices = req.body;
        if (!Array.isArray(invoices)) {
            return res.status(400).json({ error: 'Invoices must be an array' });
        }

        // Replace all invoices
        await Invoice.deleteMany({});
        if (invoices.length > 0) {
            await Invoice.insertMany(invoices);
        }

        res.json({ success: true, message: 'Invoices saved successfully' });
    } catch (error) {
        console.error('Error saving invoices:', error);
        res.status(500).json({ error: 'Failed to save invoices data' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await migrateDataIfNeeded();
});
