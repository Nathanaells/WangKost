# 🔧 Setup Midtrans Webhook

## Step 1: Configure Webhook di Midtrans Dashboard

1. Login ke Midtrans Dashboard: https://dashboard.sandbox.midtrans.com/
2. Pilih project "WangKost" 
3. Go to: **Settings** → **Configuration** → **Notification URL**
4. Masukkan URL webhook Anda:
   ```
   https://your-domain.com/api/payment/webhook
   ```
   
   Untuk development (local):
   - Gunakan ngrok atau localtunnel untuk expose local server
   - Contoh: `https://abc123.ngrok.io/api/payment/webhook`

5. Save configuration

## Step 2: Test dengan Ngrok (untuk development)

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js server
npm run dev

# Di terminal lain, expose port 3000
ngrok http 3000

# Copy URL dari ngrok (contoh: https://abc123.ngrok.io)
# Update di Midtrans Dashboard: https://abc123.ngrok.io/api/payment/webhook
```

## Step 3: Verifikasi

Setelah setup:
1. Test payment menggunakan card test:
   - Card Number: `4811 1111 1111 1114`
   - CVV: `123`
   - Exp Date: `01/27`

2. Cek di terminal apakah webhook dipanggil
3. Cek transaction status terupdate di database

## Payment Test Cards (Sandbox)

### Success
- Card: `4811 1111 1111 1114`
- CVV: `123`
- Exp: `01/27`

### Failed
- Card: `4911 1111 1111 1113`
- CVV: `123`
- Exp: `01/27`

### Challenge (3DS)
- Card: `4411 1111 1111 1118`
- CVV: `123`
- Exp: `01/27`
- OTP: `112233`
