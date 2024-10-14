const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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

// List of valid codes
const validCodes = ["ABC123", "XYZ789", "LMN456", "DEF321"];

// GET Route - returns a welcome message and the list of valid codes
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Voucher Code Validator API!",
        valid_codes: validCodes
    });
});

// POST Route - validate the voucher code
app.post('/validate-code', (req, res) => {
    // Handle preflight OPTIONS request (for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ status: "OK" });
    }

    const { code, mac, router } = req.body; // Retrieve JSON data from POST request
    const clientIp = req.ip; // Get the client IP address
    console.log("MAC Address:", mac);
    console.log("Router ID:", router);
    console.log("Request made from IP:", clientIp);

    if (!code) {
        return res.status(400).json({ status: "failure", message: "Invalid JSON." });
    }

    if (validCodes.includes(code)) {
        return res.status(200).json({ status: "success", message: "Code is valid! We are logging you in." });
    } else {
        return res.status(200).json({ status: "failure", message: "Invalid code, contact support on 0741235678." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
