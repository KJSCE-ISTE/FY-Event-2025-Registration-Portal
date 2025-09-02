import express from 'express';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const PG_URI = process.env.DB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// PostgreSQL connection
const pool = new Pool({
  connectionString: PG_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Your Gmail app password
  }
});

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
}

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

// JWT Middleware
const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
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
      await pool.query(
        'INSERT INTO iste_team (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
        [email]
      );
    }

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Generate HTML email template
// Generate HTML email template with dark theme
function generateEmailHTML(firstName: string, lastName: string, userId: number): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.7;
                color: #e2e8f0;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%);
                min-height: 100vh;
                padding: 20px;
                font-weight: 400;
            }
            
            .email-wrapper {
                max-width: 650px;
                margin: 0 auto;
                background: rgba(15, 15, 35, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 
                    0 32px 64px rgba(0, 0, 0, 0.4),
                    0 8px 32px rgba(139, 92, 246, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
                padding: 60px 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: shimmer 3s ease-in-out infinite;
            }
            
            @keyframes shimmer {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(180deg); }
            }
            
            .logo {
                font-size: 3.5rem;
                font-weight: 800;
                color: #ffffff;
                margin-bottom: 16px;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                letter-spacing: 0.1em;
                position: relative;
                z-index: 2;
            }
            
            .title {
                color: #ffffff;
                font-size: 2.2rem;
                font-weight: 700;
                margin-bottom: 12px;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                position: relative;
                z-index: 2;
            }
            
            .subtitle {
                color: rgba(255, 255, 255, 0.9);
                font-size: 1.3rem;
                font-weight: 400;
                position: relative;
                z-index: 2;
            }
            
            .container {
                padding: 50px 40px;
            }
            
            .greeting {
                font-size: 1.2rem;
                color: #f1f5f9;
                margin-bottom: 24px;
                font-weight: 500;
            }
            
            .intro-text {
                font-size: 1.1rem;
                color: #cbd5e1;
                margin-bottom: 40px;
                line-height: 1.8;
            }
            
            .user-info {
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
                border: 1px solid rgba(99, 102, 241, 0.2);
                padding: 32px;
                border-radius: 16px;
                margin: 32px 0;
                position: relative;
                overflow: hidden;
            }
            
            .user-info::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
                border-radius: 16px 16px 0 0;
            }
            
            .user-info h3 {
                color: #f8fafc;
                font-size: 1.4rem;
                font-weight: 600;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .info-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .info-label {
                color: #94a3b8;
                font-weight: 500;
            }
            
            .info-value {
                color: #f1f5f9;
                font-weight: 600;
            }
            
            .qr-section {
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 48px 40px;
                border-radius: 20px;
                margin: 40px 0;
                text-align: center;
                position: relative;
                backdrop-filter: blur(10px);
            }
            
            .qr-section::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
                border-radius: 20px;
                z-index: -1;
            }
            
            .qr-title {
                color: #f8fafc;
                font-size: 1.6rem;
                font-weight: 700;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            
            .qr-description {
                color: #cbd5e1;
                font-size: 1.1rem;
                margin-bottom: 32px;
                line-height: 1.6;
            }
            
            .qr-code {
                margin: 32px 0;
                padding: 24px;
                background: #ffffff;
                border-radius: 16px;
                display: inline-block;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .qr-code img {
                width: 240px;
                height: 240px;
                border-radius: 12px;
                display: block;
            }
            
            .registration-id {
                background: linear-gradient(135deg, #f59e0b, #f97316);
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 50px;
                font-weight: 700;
                font-size: 1.1rem;
                display: inline-block;
                margin: 16px 0;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
            
            .backup-info {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-top: 24px;
                color: #fecaca;
                font-size: 0.95rem;
                line-height: 1.6;
            }
            
            .next-steps {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.2);
                border-radius: 16px;
                padding: 32px;
                margin: 40px 0;
            }
            
            .next-steps h3 {
                color: #86efac;
                font-size: 1.4rem;
                font-weight: 600;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .steps-list {
                list-style: none;
                padding: 0;
            }
            
            .steps-list li {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 16px;
                color: #d1fae5;
                font-size: 1.05rem;
                line-height: 1.6;
            }
            
            .step-icon {
                background: linear-gradient(135deg, #10b981, #059669);
                color: #ffffff;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 600;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .contact-section {
                text-align: center;
                margin: 40px 0;
                padding: 32px;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 16px;
            }
            
            .contact-section p {
                color: #cbd5e1;
                font-size: 1.1rem;
                line-height: 1.7;
            }
            
            .footer {
                background: rgba(15, 23, 42, 0.6);
                text-align: center;
                padding: 32px 40px;
                color: #64748b;
                font-size: 0.9rem;
                line-height: 1.6;
            }
            
            .footer-divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                margin: 20px 0;
            }
            
            .highlight {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 700;
            }
            
            .glow {
                text-shadow: 0 0 20px currentColor;
            }
            
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .email-wrapper {
                    border-radius: 16px;
                }
                
                .header {
                    padding: 40px 24px;
                }
                
                .container, .footer {
                    padding: 32px 24px;
                }
                
                .logo {
                    font-size: 2.8rem;
                }
                
                .title {
                    font-size: 1.8rem;
                }
                
                .qr-section {
                    padding: 32px 24px;
                }
                
                .qr-code img {
                    width: 200px;
                    height: 200px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="logo">ISTE</div>
                <h1 class="title">Registration Confirmed! 🎉</h1>
                <p class="subtitle">Welcome to our exclusive event, ${firstName}!</p>
            </div>
            
            <div class="container">
                <p class="greeting">Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p class="intro-text">
                    🚀 Thank you for registering for our event! We're absolutely thrilled to have you join us 
                    for what promises to be an incredible experience. Get ready for cutting-edge insights, 
                    networking opportunities, and unforgettable moments.
                </p>
                
                <div class="user-info">
                    <h3>✨ Your Registration Details</h3>
                    <div class="info-item">
                        <span class="info-label">Full Name</span>
                        <span class="info-value">${firstName} ${lastName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Registration ID</span>
                        <span class="info-value highlight">#${userId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value" style="color: #10b981;">✅ Confirmed</span>
                    </div>
                </div>
                
                <div class="qr-section">
                    <h2 class="qr-title">🎫 Your Digital Event Pass</h2>
                    <p class="qr-description">
                        Present this QR code at the event entrance for instant check-in. 
                        Save it to your phone or take a screenshot for easy access.
                    </p>
                    <div class="qr-code">
                        <img src="cid:qrcode" alt="QR Code for Registration #${userId}"/>
                    </div>
                    <div class="registration-id">
                        Registration ID: #${userId}
                    </div>
                    <div class="backup-info">
                        <strong>⚠️ Backup Option:</strong> If the QR code doesn't scan, simply show your 
                        Registration ID <strong>#${userId}</strong> to our team at the entrance.
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>📋 What Happens Next?</h3>
                    <ul class="steps-list">
                        <li>
                            <span class="step-icon">1</span>
                            <span>Save this email to your favorites or print it out</span>
                        </li>
                        <li>
                            <span class="step-icon">2</span>
                            <span>Screenshot or download your QR code for mobile access</span>
                        </li>
                        <li>
                            <span class="step-icon">3</span>
                            <span>Arrive 15-20 minutes early for smooth check-in</span>
                        </li>
                        <li>
                            <span class="step-icon">4</span>
                            <span>Bring a valid ID along with your digital pass</span>
                        </li>
                        <li>
                            <span class="step-icon">5</span>
                            <span>Get ready for an amazing experience! 🎉</span>
                        </li>
                    </ul>
                </div>
                
                <div class="contact-section">
                    <p>
                        <strong>Need Help?</strong><br>
                        Have questions or concerns? Our event team is here to help! 
                        Reach out to us anytime before the event.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-divider"></div>
                <p><strong>This is an automated confirmation email.</strong></p>
                <p>Please do not reply to this message.</p>
                <div class="footer-divider"></div>
                <p>© 2025 ISTE Event Management System</p>
                <p>Powered by cutting-edge technology ⚡</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, year, branch }: FormData = req.body;

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
    const result = await pool.query(
      'INSERT INTO registrations (first_name, last_name, email, phone, year, branch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [firstName, lastName, email, phone, year, branch]
    );

    const userId = result.rows[0].id;

    // Generate QR code as buffer (for email attachment)
    const qrData = JSON.stringify({
      id: userId,
      name: `${firstName} ${lastName}`,
      email: email,
      timestamp: new Date().toISOString()
    });
    
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
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
        address: process.env.GMAIL_USER!
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

  } catch (error: any) {
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

    let email: string;
    let name: string;

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }

      email = payload.email!;
      name = payload.name!;

    // Check if user is in ISTE team
    const teamResult = await pool.query(
      'SELECT * FROM iste_team WHERE email = $1',
      [email]
    );

    if (teamResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You are not part of the ISTE team.' });
    }

    // Update team member name if not set
    if (!teamResult.rows[0].name && name) {
      await pool.query(
        'UPDATE iste_team SET name = $1 WHERE email = $2',
        [name, email]
      );
    }

    // Generate JWT token
    const jwtPayload = {
      id: teamResult.rows[0].id,
      email: email,
      name: name || teamResult.rows[0].name
    };

    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: jwtPayload
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Update attendance endpoint (now protected)
app.post('/api/update-attendance', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await pool.query(
      'UPDATE registrations SET attended = TRUE WHERE id = $1 RETURNING *',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Attendance updated successfully',
      user: result.rows[0]
    });

  } catch (error: any) {
    console.error('Attendance update error:', error);
    res.status(500).json({ error: 'Failed to update attendance', details: error.message });
  }
});

// Scan QR code endpoint (for attendance)
app.post('/api/scan-qr', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: 'QR code data is required' });
    }

    let parsedData;
    try {
      // Try to parse as JSON first (new format)
      parsedData = JSON.parse(qrData);
    } catch {
      // If parsing fails, treat as plain user ID (old format)
      parsedData = { id: parseInt(qrData) };
    }

    if (!parsedData.id || isNaN(parsedData.id)) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    // First check if user exists and if attendance is already marked
    const checkResult = await pool.query(
      'SELECT * FROM registrations WHERE id = $1',
      [parsedData.id]
    );

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
    const result = await pool.query(
      'UPDATE registrations SET attended = TRUE WHERE id = $1 RETURNING *',
      [parsedData.id]
    );

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

  } catch (error: any) {
    console.error('QR scan error:', error);
    res.status(500).json({ error: 'Failed to process QR code', details: error.message });
  }
});

// Get all registrations endpoint (protected)
app.get('/api/registrations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM registrations';
    let countQuery = 'SELECT COUNT(*) FROM registrations';
    const params: any[] = [];
    
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user details', details: error.message });
  }
});

// Get attendance statistics (protected)
app.get('/api/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
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
  } catch (error: any) {
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
export default app;