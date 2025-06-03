import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = './uploads';
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
let db;

async function connectDatabase() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pc_builder'
    });
    
    console.log('Connected to MySQL database');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

// Create necessary tables
async function createTables() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Builds table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS builds (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Build components table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS build_components (
        id INT PRIMARY KEY AUTO_INCREMENT,
        build_id INT NOT NULL,
        component_type VARCHAR(50) NOT NULL,
        component_id INT NOT NULL,
        FOREIGN KEY (build_id) REFERENCES builds(id) ON DELETE CASCADE
      )
    `);

    // CPUs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cpus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        socket VARCHAR(50) NOT NULL,
        cores INT NOT NULL,
        threads INT NOT NULL,
        base_clock DECIMAL(5,2) NOT NULL,
        boost_clock DECIMAL(5,2),
        tdp INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // GPUs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS gpus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        memory_size INT NOT NULL,
        memory_type VARCHAR(50) NOT NULL,
        core_clock INT NOT NULL,
        boost_clock INT,
        tdp INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Motherboards
    await db.execute(`
      CREATE TABLE IF NOT EXISTS motherboards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        socket VARCHAR(50) NOT NULL,
        chipset VARCHAR(50) NOT NULL,
        form_factor ENUM('ATX', 'Micro-ATX', 'Mini-ITX') NOT NULL,
        ram_slots INT NOT NULL,
        max_ram INT NOT NULL,
        has_integrated_wifi BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // RAM
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ram (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        capacity INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        speed INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Storage
    await db.execute(`
      CREATE TABLE IF NOT EXISTS storage (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type ENUM('HDD', 'SSD', 'NVMe') NOT NULL,
        capacity INT NOT NULL,
        interface VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // PSU
    await db.execute(`
      CREATE TABLE IF NOT EXISTS psu (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        power INT NOT NULL,
        efficiency_rating ENUM('80 Plus', '80 Plus Bronze', '80 Plus Gold', '80 Plus Platinum') NOT NULL,
        modular BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Cases
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        form_factor ENUM('ATX', 'Micro-ATX', 'Mini-ITX') NOT NULL,
        max_gpu_length INT NOT NULL,
        max_cooler_height INT NOT NULL,
        has_rgb BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Coolers
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coolers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type ENUM('Air', 'Liquid') NOT NULL,
        socket VARCHAR(255) NOT NULL,
        tdp_supported INT NOT NULL,
        fan_size INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Monitors
    await db.execute(`
      CREATE TABLE IF NOT EXISTS monitors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        screen_size DECIMAL(4,1) NOT NULL,
        resolution VARCHAR(50) NOT NULL,
        refresh_rate INT NOT NULL,
        panel_type ENUM('TN', 'IPS', 'VA', 'OLED') NOT NULL,
        response_time DECIMAL(3,1) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Keyboards
    await db.execute(`
      CREATE TABLE IF NOT EXISTS keyboards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type ENUM('Mechanical', 'Membrane') NOT NULL,
        switch_type VARCHAR(50),
        layout VARCHAR(50) NOT NULL,
        backlight BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Mice
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mice (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        dpi INT NOT NULL,
        buttons INT NOT NULL,
        wireless BOOLEAN DEFAULT FALSE,
        rgb BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Headsets
    await db.execute(`
      CREATE TABLE IF NOT EXISTS headsets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type ENUM('Wired', 'Wireless') NOT NULL,
        microphone BOOLEAN DEFAULT TRUE,
        surround_sound BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Speakers
    await db.execute(`
      CREATE TABLE IF NOT EXISTS speakers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type ENUM('2.0', '2.1', '5.1', '7.1') NOT NULL,
        total_watts INT NOT NULL,
        bluetooth BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    // Webcams
    await db.execute(`
      CREATE TABLE IF NOT EXISTS webcams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        resolution VARCHAR(50) NOT NULL,
        fps INT NOT NULL,
        microphone BOOLEAN DEFAULT FALSE,
        autofocus BOOLEAN DEFAULT FALSE,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL
      )
    `);
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Add the /auth/me endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email, name, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Component routes
app.get('/api/components/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const [components] = await db.execute(`SELECT * FROM ${type}`);
    res.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/components/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const [components] = await db.execute(`SELECT * FROM ${type} WHERE id = ?`, [id]);
    if (components.length === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json(components[0]);
  } catch (error) {
    console.error('Error fetching component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin component routes
app.post('/api/admin/components/:type', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  const { type } = req.params;
  const componentData = req.body;
  
  if (req.file) {
    componentData.image_url = `/uploads/${req.file.filename}`;
  }
  
  try {
    const columns = Object.keys(componentData).join(', ');
    const values = Object.values(componentData);
    const placeholders = values.map(() => '?').join(', ');
    
    const [result] = await db.execute(
      `INSERT INTO ${type} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    res.status(201).json({
      message: 'Component created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/components/:type/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  const { type, id } = req.params;
  const componentData = req.body;
  
  try {
    if (req.file) {
      // Delete old image if exists
      const [oldComponent] = await db.execute(`SELECT image_url FROM ${type} WHERE id = ?`, [id]);
      if (oldComponent[0]?.image_url) {
        const oldPath = path.join(__dirname, '..', oldComponent[0].image_url);
        await fs.unlink(oldPath).catch(() => {});
      }
      
      componentData.image_url = `/uploads/${req.file.filename}`;
    }
    
    const updates = Object.entries(componentData)
      .map(([key, _]) => `${key} = ?`)
      .join(', ');
    
    await db.execute(
      `UPDATE ${type} SET ${updates} WHERE id = ?`,
      [...Object.values(componentData), id]
    );
    
    res.json({ message: 'Component updated successfully' });
  } catch (error) {
    console.error('Error updating component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/components/:type/:id', authenticateToken, isAdmin, async (req, res) => {
  const { type, id } = req.params;
  
  try {
    // Delete image if exists
    const [component] = await db.execute(`SELECT image_url FROM ${type} WHERE id = ?`, [id]);
    if (component[0]?.image_url) {
      const imagePath = path.join(__dirname, '..', component[0].image_url);
      await fs.unlink(imagePath).catch(() => {});
    }
    
    await db.execute(`DELETE FROM ${type} WHERE id = ?`, [id]);
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Build routes
app.post('/api/builds', authenticateToken, async (req, res) => {
  const { name, components, totalPrice } = req.body;
  
  try {
    // Start transaction
    await db.beginTransaction();
    
    // Insert build
    const [buildResult] = await db.execute(
      'INSERT INTO builds (user_id, name, total_price) VALUES (?, ?, ?)',
      [req.user.id, name, totalPrice]
    );
    
    const buildId = buildResult.insertId;
    
    // Insert build components
    for (const [type, component] of Object.entries(components)) {
      if (component) {
        await db.execute(
          'INSERT INTO build_components (build_id, component_type, component_id) VALUES (?, ?, ?)',
          [buildId, type, component.id]
        );
      }
    }
    
    // Commit transaction
    await db.commit();
    
    res.status(201).json({
      message: 'Build saved successfully',
      buildId
    });
  } catch (error) {
    // Rollback on error
    await db.rollback();
    console.error('Build save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/builds', authenticateToken, async (req, res) => {
  try {
    const [builds] = await db.execute(
      'SELECT * FROM builds WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    // Fetch components for each build
    const buildsWithComponents = await Promise.all(
      builds.map(async (build) => {
        const [components] = await db.execute(
          'SELECT * FROM build_components WHERE build_id = ?',
          [build.id]
        );
        
        const componentDetails = await Promise.all(
          components.map(async (comp) => {
            const [details] = await db.execute(
              `SELECT * FROM ${comp.component_type}s WHERE id = ?`,
              [comp.component_id]
            );
            return {
              type: comp.component_type,
              ...details[0]
            };
          })
        );
        
        return {
          ...build,
          components: componentDetails
        };
      })
    );
    
    res.json(buildsWithComponents);
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/builds', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [builds] = await db.execute(`
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM builds b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(builds);
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDatabase();
});