import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, 'dist');

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
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const MenuItem = mongoose.model('MenuItem', menuSchema);

const invoiceSchema = new mongoose.Schema({
    customerName: String,
    date: { type: String, required: true },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true }, // Snapshot of name at time of purchase
        price: { type: Number, required: true }, // Snapshot of price at time of purchase
        category: String,
        quantity: { type: Number, required: true },
        customPrice: Number
    }],
    paymentMethod: { type: String, required: true },
    total: { type: Number, required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Routes

// --- Menu Routes ---

// Get all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const menu = await MenuItem.find({}).sort({ createdAt: -1 });
        res.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// Create a new menu item
app.post('/api/menu', async (req, res) => {
    try {
        const { name, price, category } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newItem = new MenuItem({ name, price, category });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});

// Update a menu item
app.put('/api/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

// Delete a menu item
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await MenuItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

// --- Invoice Routes ---

// Get all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Create a new invoice
app.post('/api/invoices', async (req, res) => {
    try {
        const invoiceData = req.body;

        // Basic validation
        if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
            return res.status(400).json({ error: 'Invoice must have items' });
        }

        const newInvoice = new Invoice(invoiceData);
        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// Delete an invoice
app.delete('/api/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
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
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
