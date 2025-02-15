const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'example@gmail.com',  // Your Gmail address
        pass: 'yourPassword'            // Your App Password
    }
});

app.use(cors());

// Endpoint to receive files and send emails
app.post('/send-email', upload.fields([{ name: 'csvFile' }, { name: 'pdfFile' }]), (req, res) => {
    const csvFile = req.files['csvFile'] ? req.files['csvFile'][0].path : null;
    const pdfFile = req.files['pdfFile'] ? req.files['pdfFile'][0].path : null;

    if (!csvFile || !pdfFile) {
        return res.status(400).send('Both CSV and PDF files are required.');
    }

    const results = [];

    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            let emailsSent = 0;

            results.forEach(user => {
                const emailContent = `
                    <div style="font-family: Arial, sans-serif; color: black;">
                        <h2>Welcome to CAL! 🎉</h2>
                        <p>Hello <strong>${user.first_name} ${user.last_name}</strong>,</p>
                        <p>We are excited to have you on board. Below are your login credentials:</p>
                        <p><strong>Username:</strong> ${user.email}</p>
                        <p><strong>Password:</strong> ${user.password}</p>
                        <p>Best Regards,</p>
                        <p><strong>CAL Team</strong></p>
                        <div class="footer">
                          <p>Need help? Contact us at <a href="mailto:vicharanalabs@gmail.com">vicharanalabs@gmail.com</a></p>
                        </div>
                    </div>
                `;

                if (fs.existsSync(pdfFile)) {
                    const mailOptions = {
                        from: 'example@gmail.com',
                        to: user.email,
                        subject: 'Welcome to CAL!',
                        html: emailContent,
                        attachments: [{
                            filename: 'WelcomeDocument.pdf',
                            path: pdfFile,
                            contentType: 'application/pdf'
                        }]
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                        emailsSent++;
                        if (error) {
                            console.log('Error sending email to:', user.email, error);
                        } else {
                            console.log('Email sent to:', user.email, 'ID:', info.messageId);
                        }

                        // Clean up files after all emails have been sent
                        if (emailsSent === results.length) {
                            fs.unlinkSync(csvFile);
                            fs.unlinkSync(pdfFile);
                        }
                    });
                } else {
                    console.log('PDF file not found:', pdfFile);
                }
            });

            res.json({ message: "Emails are being processed." });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
