const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Use mysql2 for promise support

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS from all origins
app.use(cors({
    origin: '*', 
    methods: '*', 
    allowedHeaders: '*'
}));

// Parse JSON bodies
app.use(bodyParser.json());

// Database connection configuration
const dbConfig = {
    host: 'mikrotik-mikrotik-test.b.aivencloud.com',
    port: 12719,
    user: 'avnadmin',
    password: 'AVNS_d3eJ-Wz8EYpUJldlaJy',
    database: 'mikrotik'
};

// GET Route - returns a welcome message
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Voucher Code Validator API!"
    });
});

// POST Route - validate the voucher code
app.post('/validate-code', async (req, res) => {
    // Handle preflight OPTIONS request (for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ status: "OK" });
    }

    const { code, mac, router } = req.body; // Retrieve JSON data from POST request
    const clientIp = req.ip; // Get the client IP address
    console.log("MAC Address:", mac);
    console.log("Router ID:", router);
    console.log("Request made from IP:", clientIp);

    if (!code || !mac || !router) {
        return res.status(400).json({ status: "failure", message: "Invalid JSON. Missing parameters." });
    }

    try {
        // Create a connection to the database
        const connection = await mysql.createConnection(dbConfig);

        // Query to check for the voucher code and its status along with router_id
        const [rows] = await connection.execute(
            'SELECT status, router_id FROM hotspot_vouchers WHERE voucher_code = ?',
            [code]
        );

        // Check if any row was returned
        if (rows.length === 0) {
            return res.status(404).json({ status: "failure", message: "Code not found." });
        }

        const { status, router_id } = rows[0];

        if (status === 'used') {
            return res.status(200).json({ status: "failure", message: "Code has already been used." });
        } else if (router_id !== router) {
            return res.status(200).json({ status: "failure", message: "Router ID does not match." });
        } else {
            // Update the mac_address field and change the status to 'used' for the given code
            await connection.execute(
                'UPDATE hotspot_vouchers SET mac_address = ?, status = ? WHERE voucher_code = ?',
                [mac, 'used', code]
            );
            return res.status(200).json({ status: "success", message: "Code is valid! We are logging you in." });
        }

    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ status: "failure", message: "Internal server error." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
