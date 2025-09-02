import express from 'express';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const PG_URI = process.env.DB_URI;

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

// Initialize database table
async function initializeDatabase() {
  try {
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
    console.log('Database table initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Generate HTML email template
function generateEmailHTML(firstName: string, lastName: string, userId: number): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .title {
                color: #2c3e50;
                font-size: 1.8em;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #7f8c8d;
                font-size: 1.1em;
            }
            .content {
                margin: 30px 0;
            }
            .qr-section {
                text-align: center;
                background: #f8f9fa;
                padding: 30px;
                border-radius: 10px;
                margin: 30px 0;
            }
            .qr-title {
                color: #2c3e50;
                font-size: 1.3em;
                margin-bottom: 15px;
            }
            .qr-code {
                margin: 20px 0;
            }
            .user-info {
                background: linear-gradient(135deg, #74b9ff, #0984e3);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                color: #7f8c8d;
                font-size: 0.9em;
            }
            .button {
                display: inline-block;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                margin: 20px 0;
                font-weight: bold;
            }
            .highlight {
                color: #e74c3c;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ISTE</div>
                <h1 class="title">Registration Confirmed! 🎉</h1>
                <p class="subtitle">Welcome to our event, ${firstName}!</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                <p>Thank you for registering for our event! We're excited to have you join us.</p>
                
                <div class="user-info">
                    <h3 style="margin-top: 0;">Your Registration Details</h3>
                    <div class="info-item">
                        <span>Name:</span>
                        <span>${firstName} ${lastName}</span>
                    </div>
                    <div class="info-item">
                        <span>Registration ID:</span>
                        <span class="highlight">#${userId}</span>
                    </div>
                </div>
            </div>
            
            <div class="qr-section">
                <h2 class="qr-title">🎫 Your Event Pass</h2>
                <p>Please present this QR code at the event entrance:</p>
                <div class="qr-code" id="qrcode"></div>
                <p><small>Registration ID: <span class="highlight">${userId}</span></small></p>
            </div>
            
            <div class="content">
                <h3>📅 What's Next?</h3>
                <ul>
                    <li>Save this email for your records</li>
                    <li>Bring your QR code to the event (screenshot or print)</li>
                    <li>Arrive 15 minutes early for check-in</li>
                </ul>
                
                <p>If you have any questions, feel free to contact our event team.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>© 2025 ISTE Event Management</p>
            </div>
        </div>
        
        <script>
            // QR Code will be embedded as base64 image
        </script>
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

    // Insert into database
    const result = await pool.query(
      'INSERT INTO registrations (first_name, last_name, email, phone, year, branch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [firstName, lastName, email, phone, year, branch]
    );

    const userId = result.rows[0].id;

    // Generate QR code
    const qrData = userId.toString();
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#2c3e50',
        light: '#ffffff'
      }
    });

    // Generate email HTML
    let emailHTML = generateEmailHTML(firstName, lastName, userId);
    
    // Replace QR code placeholder with actual QR code
    emailHTML = emailHTML.replace(
      '<div class="qr-code" id="qrcode"></div>',
      `<div class="qr-code"><img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 200px; border-radius: 10px;"/></div>`
    );

    // Send email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '🎉 Event Registration Confirmed - ISTE',
      html: emailHTML
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Registration successful',
      userId: userId,
      email: 'Confirmation email sent'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') { // Duplicate email error
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Update attendance endpoint
app.post('/api/update-attendance', async (req, res) => {
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

// Get user details endpoint (optional)
app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database on startup
initializeDatabase();

// Export for Vercel
export default app;