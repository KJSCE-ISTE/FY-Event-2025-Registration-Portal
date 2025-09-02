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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
                padding: 40px 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                text-align: center;
                color: white;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: 2px;
            }
            
            .title {
                font-size: 20px;
                font-weight: 400;
                opacity: 0.95;
            }
            
            .content {
                padding: 40px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 24px;
                color: #1a202c;
            }
            
            .message {
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 32px;
                line-height: 1.7;
            }
            
            .details-card {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 24px;
                margin: 32px 0;
            }
            
            .details-title {
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 16px;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                color: #718096;
                font-weight: 500;
            }
            
            .detail-value {
                color: #2d3748;
                font-weight: 600;
            }
            
            .qr-section {
                text-align: center;
                padding: 32px;
                background: #f7fafc;
                border-radius: 8px;
                margin: 32px 0;
            }
            
            .qr-title {
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 12px;
            }
            
            .qr-description {
                font-size: 14px;
                color: #718096;
                margin-bottom: 24px;
            }
            
            .qr-code {
                background: white;
                padding: 20px;
                border-radius: 8px;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                margin-bottom: 16px;
            }
            
            .qr-code img {
                width: 200px;
                height: 200px;
                display: block;
            }
            
            .registration-id {
                background: #667eea;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                display: inline-block;
            }
            
            .instructions {
                background: #edf2f7;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 32px 0;
                border-radius: 0 4px 4px 0;
            }
            
            .instructions h3 {
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 12px;
            }
            
            .instructions ul {
                list-style: none;
                padding: 0;
            }
            
            .instructions li {
                padding: 4px 0;
                color: #4a5568;
                position: relative;
                padding-left: 20px;
            }
            
            .instructions li::before {
                content: "•";
                color: #667eea;
                position: absolute;
                left: 0;
                font-weight: bold;
            }
            
            .footer {
                background: #f7fafc;
                padding: 32px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                color: #718096;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .footer p:last-child {
                margin-bottom: 0;
            }
            
            @media (max-width: 600px) {
                body {
                    padding: 20px 10px;
                }
                
                .header {
                    padding: 32px 24px;
                }
                
                .content, .footer {
                    padding: 32px 24px;
                }
                
                .qr-section {
                    padding: 24px;
                }
                
                .qr-code img {
                    width: 160px;
                    height: 160px;
                }
                
                .detail-row {
                    flex-direction: column;
                    gap: 4px;
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
                <div class="greeting">Hello ${firstName},</div>
                
                <div class="message">
                    Thank you for registering for our event! Your registration has been confirmed 
                    and we're excited to have you join us.
                </div>
                
                <div class="details-card">
                    <div class="details-title">Registration Details</div>
                    <div class="detail-row">
                        <span class="detail-label">Name</span>
                        <span class="detail-value">${firstName} ${lastName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Registration ID</span>
                        <span class="detail-value">#${userId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" style="color: #48bb78;">Confirmed</span>
                    </div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-title">Your Event Pass</div>
                    <div class="qr-description">
                        Present this QR code at the event entrance for check-in
                    </div>
                    <div class="qr-code">
                        <img src="cid:qrcode" alt="QR Code for Registration #${userId}"/>
                    </div>
                    <div class="registration-id">ID: #${userId}</div>
                </div>
                
                <div class="instructions">
                    <h3>What to do next:</h3>
                    <ul>
                        <li>Save this email or screenshot your QR code</li>
                        <li>Arrive 15 minutes early for check-in</li>
                        <li>Bring a valid ID along with your pass</li>
                        <li>If the QR code doesn't work, show your Registration ID</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated confirmation email.</p>
                <p>© 2025 ISTE Event Management System</p>
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