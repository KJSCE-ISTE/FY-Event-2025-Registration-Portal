"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const nodemailer_1 = __importDefault(require("nodemailer"));
const qrcode_1 = __importDefault(require("qrcode"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PG_URI = process.env.DB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// Google OAuth client
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
// PostgreSQL connection
const pool = new pg_1.Pool({
    connectionString: PG_URI,
    ssl: {
        rejectUnauthorized: false
    }
});
// Gmail SMTP transporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Your Gmail app password
    }
});
// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};
// Initialize database table
async function initializeDatabase() {
    try {
        // Create registrations table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        year VARCHAR(10) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        attended BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create iste_team table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS iste_team (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Insert team members if they don't exist
        const teamMembers = [
            'anamay.n@somaiya.edu',
            'tanish.shetty@gmail.com'
        ];
        for (const email of teamMembers) {
            await pool.query('INSERT INTO iste_team (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email]);
        }
        console.log('Database tables initialized');
    }
    catch (error) {
        console.error('Database initialization error:', error);
    }
}
function generateEmailHTML(firstName, lastName, userId) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.5;
                color: #ffffff;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                padding: 20px;
                min-height: 100vh;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #000000;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.8),
                    0 0 0 1px rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
            
            .header {
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
                padding: 60px 40px 50px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #34d399, #10b981);
                background-size: 200% 100%;
                animation: shimmer 3s ease-in-out infinite;
            }
            
            @keyframes shimmer {
                0%, 100% { background-position: 200% 0; }
                50% { background-position: -200% 0; }
            }
            
            .logo {
                font-size: 42px;
                font-weight: 800;
                margin-bottom: 12px;
                letter-spacing: 4px;
                background: linear-gradient(135deg, #ffffff, #e5e5e5);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
            }
            
            .title {
                font-size: 18px;
                font-weight: 500;
                color: #10b981;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .content {
                padding: 50px 40px;
                background: #000000;
            }
            
            .greeting {
                font-size: 28px;
                margin-bottom: 20px;
                color: #ffffff;
                font-weight: 700;
            }
            
            .greeting-accent {
                color: #10b981;
            }
            
            .message {
                font-size: 18px;
                color: #a3a3a3;
                margin-bottom: 40px;
                line-height: 1.7;
                font-weight: 300;
            }
            
            .details-card {
                background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 32px;
                margin: 40px 0;
                position: relative;
                overflow: hidden;
            }
            
            .details-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, #10b981, transparent);
            }
            
            .details-title {
                font-size: 20px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .details-title::before {
                content: '';
                width: 4px;
                height: 20px;
                background: #10b981;
                border-radius: 2px;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                color: #737373;
                font-weight: 500;
                font-size: 15px;
            }
            
            .detail-value {
                color: #ffffff;
                font-weight: 600;
                font-size: 16px;
            }
            
            .status-confirmed {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            
            .qr-section {
                text-align: center;
                padding: 50px 32px;
                background: linear-gradient(135deg, #0f0f0f, #1f1f1f);
                border-radius: 20px;
                margin: 40px 0;
                border: 1px solid rgba(255, 255, 255, 0.05);
                position: relative;
            }
            
            .qr-section::before {
                content: '';
                position: absolute;
                inset: 0;
                padding: 1px;
                background: linear-gradient(135deg, #10b981, transparent, #10b981);
                border-radius: 20px;
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask-composite: xor;
                -webkit-mask-composite: xor;
            }
            
            .qr-title {
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 8px;
            }
            
            .qr-description {
                font-size: 16px;
                color: #a3a3a3;
                margin-bottom: 32px;
                font-weight: 300;
            }
            
            .qr-code {
                background: #ffffff;
                padding: 24px;
                border-radius: 16px;
                display: inline-block;
                box-shadow: 
                    0 20px 25px -5px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(16, 185, 129, 0.1);
                margin-bottom: 24px;
                position: relative;
                overflow: hidden;
            }
            
            .qr-code::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #10b981, #34d399, #10b981);
                border-radius: 18px;
                z-index: -1;
            }
            
            .qr-code img {
                width: 200px;
                height: 200px;
                display: block;
                border-radius: 8px;
            }
            
            .registration-id {
                background: linear-gradient(135deg, #10b981, #059669);
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 700;
                font-size: 16px;
                display: inline-block;
                letter-spacing: 1px;
                box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .instructions {
                background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-left: 4px solid #10b981;
                padding: 32px;
                margin: 40px 0;
                border-radius: 12px;
                position: relative;
            }
            
            .instructions::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(to bottom, #10b981, #34d399, #10b981);
            }
            
            .instructions h3 {
                font-size: 20px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .instructions h3::before {
                content: '✓';
                color: #10b981;
                font-size: 18px;
                font-weight: bold;
            }
            
            .instructions ul {
                list-style: none;
                padding: 0;
            }
            
            .instructions li {
                padding: 12px 0;
                color: #d4d4d4;
                position: relative;
                padding-left: 32px;
                font-size: 16px;
                font-weight: 300;
                transition: color 0.2s ease;
            }
            
            .instructions li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
            }
            
            .instructions li:hover {
                color: #ffffff;
            }
            
            .footer {
                background: #000000;
                padding: 40px;
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
            }
            
            .footer-content {
                border-top: 1px solid rgba(16, 185, 129, 0.2);
                padding-top: 24px;
            }
            
            .footer p {
                color: #737373;
                font-size: 14px;
                margin-bottom: 8px;
                font-weight: 300;
            }
            
            .footer p:last-child {
                margin-bottom: 0;
                font-weight: 500;
                color: #10b981;
            }
            
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .header {
                    padding: 40px 24px 32px;
                }
                
                .logo {
                    font-size: 36px;
                    letter-spacing: 2px;
                }
                
                .title {
                    font-size: 16px;
                }
                
                .content, .footer {
                    padding: 32px 24px;
                }
                
                .greeting {
                    font-size: 24px;
                }
                
                .message {
                    font-size: 16px;
                }
                
                .details-card, .instructions {
                    padding: 24px;
                }
                
                .qr-section {
                    padding: 32px 24px;
                }
                
                .qr-code img {
                    width: 160px;
                    height: 160px;
                }
                
                .detail-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .detail-value {
                    align-self: flex-end;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ISTE</div>
                <div class="title">Registration Confirmed</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hello <span class="greeting-accent">${firstName}</span>,</div>
                
                <div class="message">
                    Thank you for registering for our event! Your registration has been confirmed 
                    and we're excited to have you join us for this incredible experience.
                </div>
                
                <div class="details-card">
                    <div class="details-title">Registration Details</div>
                    <div class="detail-row">
                        <span class="detail-label">Full Name</span>
                        <span class="detail-value">${firstName} ${lastName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Registration ID</span>
                        <span class="detail-value">#${userId.toString().padStart(4, '0')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value status-confirmed">Confirmed</span>
                    </div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-title">Your Digital Pass</div>
                    <div class="qr-description">
                        Present this QR code at the event entrance for instant check-in
                    </div>
                    <div class="qr-code">
                        <img src="cid:qrcode" alt="QR Code for Registration #${userId}"/>
                    </div>
                    <div class="registration-id">ID: #${userId.toString().padStart(4, '0')}</div>
                </div>
                
                <div class="instructions">
                    <h3>What's Next?</h3>
                    <ul>
                        <li>Save this email or screenshot your QR code for quick access</li>
                        <li>Arrive 15 minutes early to ensure smooth check-in process</li>
                        <li>Bring a valid government-issued ID along with your digital pass</li>
                        <li>If QR code scanning fails, simply show your Registration ID to staff</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-content">
                    <p>This is an automated confirmation email from our secure system.</p>
                    <p>© 2025 ISTE Event Management System</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}
// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, year, branch } = req.body;
        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !year || !branch) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }
        // Insert into database
        const result = await pool.query('INSERT INTO registrations (first_name, last_name, email, phone, year, branch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [firstName, lastName, email, phone, year, branch]);
        const userId = result.rows[0].id;
        // Generate QR code as buffer (for email attachment)
        const qrData = JSON.stringify({
            id: userId,
            name: `${firstName} ${lastName}`,
            email: email,
            timestamp: new Date().toISOString()
        });
        const qrCodeBuffer = await qrcode_1.default.toBuffer(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#2c3e50',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
        });
        // Generate email HTML
        const emailHTML = generateEmailHTML(firstName, lastName, userId);
        // Prepare email with QR code as attachment
        const mailOptions = {
            from: {
                name: 'ISTE Event Team',
                address: process.env.GMAIL_USER
            },
            to: email,
            subject: '🎉 Event Registration Confirmed - ISTE',
            html: emailHTML,
            attachments: [
                {
                    filename: `qrcode-${userId}.png`,
                    content: qrCodeBuffer,
                    cid: 'qrcode' // This matches the src="cid:qrcode" in HTML
                }
            ]
        };
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Registration successful for ${firstName} ${lastName} (ID: ${userId})`);
        res.status(201).json({
            message: 'Registration successful',
            userId: userId,
            email: 'Confirmation email sent successfully'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') { // Duplicate email error
            return res.status(400).json({ error: 'This email is already registered for the event' });
        }
        res.status(500).json({
            error: 'Registration failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});
// Google OAuth login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }
        let email;
        let name;
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }
        email = payload.email;
        name = payload.name;
        // Check if user is in ISTE team
        const teamResult = await pool.query('SELECT * FROM iste_team WHERE email = $1', [email]);
        if (teamResult.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied. You are not part of the ISTE team.' });
        }
        // Update team member name if not set
        if (!teamResult.rows[0].name && name) {
            await pool.query('UPDATE iste_team SET name = $1 WHERE email = $2', [name, email]);
        }
        // Generate JWT token
        const jwtPayload = {
            id: teamResult.rows[0].id,
            email: email,
            name: name || teamResult.rows[0].name
        };
        const token = jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: jwtPayload
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});
// Update attendance endpoint (now protected)
app.post('/api/update-attendance', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const result = await pool.query('UPDATE registrations SET attended = TRUE WHERE id = $1 RETURNING *', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            message: 'Attendance updated successfully',
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Attendance update error:', error);
        res.status(500).json({ error: 'Failed to update attendance', details: error.message });
    }
});
// Scan QR code endpoint (for attendance)
app.post('/api/scan-qr', authenticateToken, async (req, res) => {
    try {
        const { qrData } = req.body;
        if (!qrData) {
            return res.status(400).json({ error: 'QR code data is required' });
        }
        let parsedData;
        try {
            // Try to parse as JSON first (new format)
            parsedData = JSON.parse(qrData);
        }
        catch {
            // If parsing fails, treat as plain user ID (old format)
            parsedData = { id: parseInt(qrData) };
        }
        if (!parsedData.id || isNaN(parsedData.id)) {
            return res.status(400).json({ error: 'Invalid QR code format' });
        }
        // First check if user exists and if attendance is already marked
        const checkResult = await pool.query('SELECT * FROM registrations WHERE id = $1', [parsedData.id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        const user = checkResult.rows[0];
        if (user.attended) {
            return res.status(400).json({
                error: 'Attendance already marked for this user',
                user: {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    year: user.year,
                    branch: user.branch,
                    attended: user.attended
                }
            });
        }
        // Mark attendance
        const result = await pool.query('UPDATE registrations SET attended = TRUE WHERE id = $1 RETURNING *', [parsedData.id]);
        const updatedUser = result.rows[0];
        res.status(200).json({
            message: 'Attendance marked successfully',
            user: {
                id: updatedUser.id,
                name: `${updatedUser.first_name} ${updatedUser.last_name}`,
                email: updatedUser.email,
                year: updatedUser.year,
                branch: updatedUser.branch,
                attended: updatedUser.attended
            }
        });
    }
    catch (error) {
        console.error('QR scan error:', error);
        res.status(500).json({ error: 'Failed to process QR code', details: error.message });
    }
});
// Get all registrations endpoint (protected)
app.get('/api/registrations', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = 'SELECT * FROM registrations';
        let countQuery = 'SELECT COUNT(*) FROM registrations';
        const params = [];
        if (search) {
            query += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1';
            countQuery += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(Number(limit), offset);
        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, search ? [`%${search}%`] : [])
        ]);
        res.status(200).json({
            registrations: result.rows,
            total: parseInt(countResult.rows[0].count),
            currentPage: Number(page),
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
        });
    }
    catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({ error: 'Failed to get registrations', details: error.message });
    }
});
// Get user details endpoint
app.get('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const result = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user details', details: error.message });
    }
});
// Get attendance statistics (protected)
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(*) FILTER (WHERE attended = true) as total_attended,
        COUNT(*) FILTER (WHERE attended = false) as total_not_attended,
        ROUND(
          (COUNT(*) FILTER (WHERE attended = true) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) as attendance_percentage
      FROM registrations
    `);
        res.status(200).json(stats.rows[0]);
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get statistics', details: error.message });
    }
});
// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'ISTE Event Registration API'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Initialize database on startup
initializeDatabase();
// Start server (for local development)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
// Export for Vercel
exports.default = app;
//# sourceMappingURL=index.js.map