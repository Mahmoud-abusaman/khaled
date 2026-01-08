import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const DIST_DIR = path.join(__dirname, 'dist');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist folder in production
app.use(express.static(DIST_DIR));

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log('📁 Created data directory');
    }
}

// Read JSON file with error handling
async function readJSONFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, create it with default value
            await writeJSONFile(filePath, defaultValue);
            return defaultValue;
        }
        throw error;
    }
}

// Write JSON file
async function writeJSONFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes

// Get menu
app.get('/api/menu', async (req, res) => {
    try {
        const menu = await readJSONFile(MENU_FILE, []);
        res.json(menu);
    } catch (error) {
        console.error('Error reading menu:', error);
        res.status(500).json({ error: 'Failed to read menu data' });
    }
});

// Save menu
app.post('/api/menu', async (req, res) => {
    try {
        const menu = req.body;
        if (!Array.isArray(menu)) {
            return res.status(400).json({ error: 'Menu must be an array' });
        }
        await writeJSONFile(MENU_FILE, menu);
        res.json({ success: true, message: 'Menu saved successfully' });
    } catch (error) {
        console.error('Error saving menu:', error);
        res.status(500).json({ error: 'Failed to save menu data' });
    }
});

// Get invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await readJSONFile(INVOICES_FILE, []);
        res.json(invoices);
    } catch (error) {
        console.error('Error reading invoices:', error);
        res.status(500).json({ error: 'Failed to read invoices data' });
    }
});

// Save invoices
app.post('/api/invoices', async (req, res) => {
    try {
        const invoices = req.body;
        if (!Array.isArray(invoices)) {
            return res.status(400).json({ error: 'Invoices must be an array' });
        }
        await writeJSONFile(INVOICES_FILE, invoices);
        res.json({ success: true, message: 'Invoices saved successfully' });
    } catch (error) {
        console.error('Error saving invoices:', error);
        res.status(500).json({ error: 'Failed to save invoices data' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve index.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Start server
async function startServer() {
    await ensureDataDir();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Data directory: ${DATA_DIR}`);
    });
}

startServer().catch(console.error);
