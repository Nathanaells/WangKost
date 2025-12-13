# 🚀 Quick Start - Test Complete Flow

## Persiapan

1. ✅ Keys Midtrans sudah ada di .env
2. ✅ Database MongoDB sudah running
3. ✅ Packages sudah di-install

## 📝 Step-by-Step Testing

### Step 1: Start Server

```bash
cd d:\HackativeP3\FinalProject\WangKost\app
npm run dev
```

### Step 2: Initialize Cron Job

Buka browser atau terminal baru:

```bash
# Via browser
http://localhost:3000/api/cron/init

# Via curl
curl http://localhost:3000/api/cron/init
```

Expected response:

```json
{
  "message": "Cron jobs initialized successfully",
  "status": "started"
}
```

### Step 3: Login Admin

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "phoneNumber": "08123456789",
  "password": "your-password"
}
```

Save the `access_token` dari response.

### Step 4: Buat Hostel

```bash
POST http://localhost:3000/api/hostels
Content-Type: application/json
x-owner-id: YOUR_OWNER_ID

{
  "name": "Kost Test",
  "address": "Jl. Test No. 123",
  "maxRoom": 10,
  "description": "Kost untuk testing"
}
```

Save `hostelId` dari response.

### Step 5: Tambah Room

```bash
POST http://localhost:3000/api/hostels/[hostelId]/rooms
Content-Type: application/json
x-owner-id: YOUR_OWNER_ID

{
  "fixedCost": 1000000
}
```

Save `roomId` dari response.

### Step 6: Buat Tenant

```bash
POST http://localhost:3000/api/tenants
Content-Type: application/json
x-owner-id: YOUR_OWNER_ID

{
  "name": "Test Tenant",
  "email": "test@example.com",
  "phoneNumber": "081234567890",
  "birthday": "1995-01-01",
  "isActive": true
}
```

Save `tenantId` dari response.

### Step 7: Add Tenant ke Room (⭐ Main Feature)

```bash
POST http://localhost:3000/api/hostels/[hostelId]/rooms/[roomId]/add-tenant
Content-Type: application/json
x-owner-id: YOUR_OWNER_ID

{
  "tenantId": "[tenantId dari step 6]",
  "joinAt": "2025-12-13"
}
```

Expected response:

```json
{
  "message": "Tenant added to room successfully",
  "data": {
    "rentId": "67...",
    "totalPrice": 1500000, // room cost + additionals
    "joinAt": "2025-12-13T00:00:00.000Z"
  }
}
```

✅ Rent otomatis terbuat dengan semua additionals!

### Step 8: Generate Invoice (Manual Test)

```bash
POST http://localhost:3000/api/invoices/generate
Content-Type: application/json
x-owner-id: YOUR_OWNER_ID

{
  "rentId": "[rentId dari step 7]"
}
```

Expected response:

```json
{
  "message": "Invoice generated successfully",
  "data": {
    "invoiceNumber": "INV-1234567890-67...",
    "paymentUrl": "https://app.sandbox.midtrans.com/snap/v3/...",
    "paymentToken": "abc123...",
    "pdfBase64": "JVBERi0xLjQKJeLjz9MK...", // very long base64
    "tenantPhone": "081234567890",
    "tenantEmail": "test@example.com"
  }
}
```

### Step 9: Test Payment

1. Copy `paymentUrl` dari response Step 8
2. Buka di browser
3. Gunakan test card:
   - **Card Number:** `4811 1111 1111 1114`
   - **CVV:** `123`
   - **Exp Date:** `01/27`
4. Complete payment

### Step 10: Verify Transaction Updated

```bash
GET http://localhost:3000/api/transactions
Content-Type: application/json
x-owner-id: YOUR_OWNER_ID
```

Seharusnya status transaction berubah dari `PENDING` → `PAID`

---

## 🧪 Testing Cron Job

### Option 1: Wait for Midnight (Real Scenario)

Cron akan jalan otomatis setiap jam 00:00. Check logs di pagi hari.

### Option 2: Test dengan Manual Trigger

Sudah di-test di Step 8 (manual generate invoice).

### Option 3: Change Schedule (Development Only)

Edit `server/helpers/cronJobs.ts`:

```javascript
// Original (daily at midnight)
cron.schedule("0 0 * * *", async () => {

// Change to every minute for testing
cron.schedule("* * * * *", async () => {
```

Restart server & cron akan jalan setiap menit.

**⚠️ IMPORTANT:** Jangan lupa kembalikan ke `0 0 * * *` setelah testing!

---

## 📱 Setup WhatsApp (Optional - n8n)

Jika ingin test WhatsApp notification lengkap:

1. **Setup n8n:**

   - Install n8n: `npm install -g n8n`
   - Start: `n8n start`
   - Access: `http://localhost:5678`

2. **Create Workflow:**

   - Import workflow dari `IMPLEMENTATION_GUIDE.md`
   - Setup WhatsApp API (Fonnte/Wablas)
   - Get webhook URL

3. **Update .env:**

   ```env
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-invoice
   ```

4. **Test:**
   - Run invoice generation (Step 8)
   - Check n8n execution log
   - Check WhatsApp received

---

## 🎯 What to Check

### Database (MongoDB)

Check collections:

- `hostels` - hostel baru
- `rooms` - room baru dengan tenant
- `tenants` - tenant baru dengan rents array
- `rents` - rent baru dengan additionals
- `transactions` - transaction records

### Logs

```bash
# Check console untuk:
- "Invoice generation cron job started"
- "Invoice generated for rent [rentId]"
- "Invoice sent to [name] via WhatsApp"
```

### Midtrans Dashboard

1. Login: https://dashboard.sandbox.midtrans.com/
2. Go to **Transactions**
3. Cari invoice number dari Step 8
4. Check status payment

---

## 🐛 Common Issues

### 1. Cron not starting

**Solution:**

```bash
# Call init endpoint
curl http://localhost:3000/api/cron/init
```

### 2. PDF generation error

**Solution:**

```bash
# Reinstall puppeteer
npm uninstall puppeteer
npm install puppeteer --force
```

### 3. Midtrans payment failed

**Check:**

- Server key & client key benar di .env
- Webhook URL sudah di-set di Midtrans dashboard
- Gunakan test cards yang benar

### 4. Transaction not updating

**Check:**

- Webhook signature verification
- Midtrans can reach your webhook URL
- For local: use ngrok

---

## ✅ Success Indicators

Jika semua berhasil, Anda akan lihat:

1. ✅ Rent terbuat dengan additionals
2. ✅ Invoice PDF ter-generate
3. ✅ Payment link Midtrans bisa dibuka
4. ✅ Payment berhasil
5. ✅ Transaction status updated
6. ✅ WhatsApp terkirim (jika n8n setup)

---

## 📞 Need Help?

Check dokumentasi:

- `API_ROUTES.md` - API reference
- `IMPLEMENTATION_GUIDE.md` - Complete guide
- `CRONJOB_SETUP.md` - Cron job details
- `MIDTRANS_SETUP.md` - Midtrans webhook setup
