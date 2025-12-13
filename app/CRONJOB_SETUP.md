# ⏰ Cron Job Setup Guide

## 🎯 Apa yang Dilakukan Cron Job?

Cron job akan jalan **setiap hari pukul 00:00 (midnight)** dan:

1. Mengecek semua rent yang aktif
2. Menghitung tanggal pembayaran berikutnya (1 bulan dari joinAt)
3. Jika **7 hari sebelum** tanggal pembayaran:
   - Generate invoice PDF dengan barcode
   - Buat payment link Midtrans
   - Simpan ke database (Transactions)
   - Kirim ke n8n webhook (untuk WhatsApp)

## 📝 Setup Steps

### 1. Install Dependencies (sudah dilakukan)

```bash
npm install node-cron puppeteer bwip-js midtrans-client
```

### 2. Start Cron Job

Ada 2 cara untuk menjalankan cron job:

#### **Cara 1: Manual via API Call (Recommended untuk Development)**

Setelah server running:

```bash
# Start server
npm run dev

# Di terminal lain atau browser, call:
curl http://localhost:3000/api/cron/init

# Atau buka di browser:
# http://localhost:3000/api/cron/init
```

Response:

```json
{
  "message": "Cron jobs initialized successfully",
  "status": "started"
}
```

#### **Cara 2: Auto-start saat Server Start (Production)**

Buat file `scripts/init-cron.sh`:

```bash
#!/bin/bash
echo "Starting server..."
npm start &

echo "Waiting for server to be ready..."
sleep 10

echo "Initializing cron jobs..."
curl http://localhost:3000/api/cron/init

echo "Cron jobs initialized!"
```

Jalankan:

```bash
chmod +x scripts/init-cron.sh
./scripts/init-cron.sh
```

### 3. Verifikasi Cron Job Berjalan

Cek console log, seharusnya ada:

```
Invoice generation cron job started (runs daily at midnight)
```

### 4. Test Manual (Tanpa Tunggu Cron)

Untuk testing, Anda bisa generate invoice manual:

```bash
POST http://localhost:3000/api/invoices/generate
Headers:
  x-owner-id: YOUR_OWNER_ID
Body:
{
  "rentId": "YOUR_RENT_ID"
}
```

## 🧪 Testing Scenarios

### Scenario 1: Test Immediate Invoice Generation

```bash
# 1. Buat tenant baru dengan joinAt hari ini
POST /api/tenants
{
  "name": "Test Tenant",
  "email": "test@example.com",
  "phoneNumber": "081234567890",
  "birthday": "1995-01-01"
}

# 2. Add tenant ke room
POST /api/hostels/[hostelId]/rooms/[roomId]/add-tenant
{
  "tenantId": "[tenantId]",
  "joinAt": "2025-12-13"  // Today
}

# 3. Generate invoice manual (untuk testing)
POST /api/invoices/generate
{
  "rentId": "[rentId yang baru dibuat]"
}

# 4. Cek response - akan dapat:
# - PDF base64
# - Payment URL
# - Invoice number
```

### Scenario 2: Test Cron Job Logic

Untuk test cron job dengan tanggal custom:

```javascript
// Edit cronJobs.ts temporarily untuk testing
// Ganti baris:
if (daysUntilPayment === 7) {

// Menjadi:
if (daysUntilPayment <= 30) {  // Test: generate untuk 30 hari ke depan

// Jangan lupa kembalikan setelah testing!
```

## 📊 Monitoring Cron Job

### 1. Check Logs

```bash
# Lihat logs
tail -f logs/cron.log  # jika ada log file

# Atau di console
# Seharusnya muncul:
# "Running invoice generation cron job..."
# "Invoice generated for rent [rentId]"
# "Invoice sent to [tenant name] via WhatsApp"
```

### 2. Check Database

```javascript
// Check transactions yang dibuat oleh cron
db.transactions
  .find({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  })
  .sort({ createdAt: -1 });
```

## 🔄 Cron Schedule Patterns

Default: `0 0 * * *` (Midnight every day)

Jika ingin ubah schedule:

```javascript
// Di cronJobs.ts
cron.schedule("0 0 * * *", async () => {
  // Setiap hari jam 00:00
});

// Contoh lain:
// "0 9 * * *"    - Setiap hari jam 09:00
// "0 */6 * * *"  - Setiap 6 jam
// "0 0 1 * *"    - Setiap tanggal 1 (monthly)
// "*/30 * * * *" - Setiap 30 menit (untuk testing)
```

## 🚨 Troubleshooting

### Cron tidak jalan?

1. **Check apakah sudah di-init:**

   ```bash
   curl http://localhost:3000/api/cron/init
   ```

2. **Check console log:**

   - Seharusnya ada: "Invoice generation cron job started"

3. **Check timezone:**

   - Cron menggunakan timezone server
   - Set di .env: `MONGOLOQUENT_TIMEZONE=Asia/Jakarta`

4. **Test dengan schedule lebih sering:**
   ```javascript
   // Untuk testing, ubah jadi setiap menit
   cron.schedule("* * * * *", async () => {
   ```

### PDF tidak ter-generate?

1. **Check Puppeteer installation:**

   ```bash
   npm install puppeteer --force
   ```

2. **Check barcode generation:**

   ```bash
   npm install bwip-js
   ```

3. **Check temp directory:**
   - Pastikan ada permission write

### WhatsApp tidak terkirim?

1. **Check n8n webhook URL di .env:**

   ```env
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/whatsapp-invoice
   ```

2. **Check n8n workflow running**

3. **Test webhook manual:**
   ```bash
   curl -X POST https://your-n8n.com/webhook/whatsapp-invoice \
   -H "Content-Type: application/json" \
   -d '{
     "phoneNumber": "6281234567890",
     "tenantName": "Test",
     "invoiceNumber": "INV-123",
     "paymentUrl": "https://...",
     "pdfBase64": "...",
     "dueDate": "2025-01-20",
     "amount": 1500000
   }'
   ```

## 📅 Timeline Example

Jika tenant join tanggal **15 Desember 2025**:

- **15 Des 2025**: Tenant join, rent dibuat
- **8 Jan 2026**: Cron job generate invoice (7 hari sebelum 15 Jan)
- **15 Jan 2026**: Due date pembayaran bulan pertama
- **8 Feb 2026**: Cron job generate invoice (7 hari sebelum 15 Feb)
- **15 Feb 2026**: Due date pembayaran bulan kedua
- dst...

## ✅ Production Checklist

- [ ] Environment variables lengkap
- [ ] Midtrans webhook configured
- [ ] n8n webhook URL set
- [ ] Puppeteer installed
- [ ] Cron job initialized (`/api/cron/init`)
- [ ] Test manual invoice generation
- [ ] Test payment flow end-to-end
- [ ] Monitor logs untuk error
- [ ] Setup alert untuk failed invoice generation

## 🎯 Best Practices

1. **Always test manual dulu** sebelum andalkan cron
2. **Monitor logs** untuk error
3. **Backup database** sebelum production
4. **Test payment** dengan sandbox cards
5. **Verify WhatsApp delivery** dengan real number

---

**Next Step:** Setup n8n workflow untuk WhatsApp (lihat IMPLEMENTATION_GUIDE.md)
