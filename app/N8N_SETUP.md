# 📱 Setup n8n untuk WhatsApp Notification

## 📋 Overview

n8n akan menerima data invoice dari cron job, lalu mengirim invoice PDF + payment link ke WhatsApp tenant.

**Flow:**
```
Cron Job → n8n Webhook → WhatsApp API → Tenant
```

---

## 🚀 Step 1: Install & Start n8n

### Install n8n (jika belum)

```bash
# Via npm (global)
npm install -g n8n

# Via npx (tanpa install)
# npx n8n
```

### Start n8n

```bash
n8n start
```

n8n akan running di: `http://localhost:5678`

---

## 🔧 Step 2: Create Workflow

### 1. Login ke n8n Dashboard
- Buka: `http://localhost:5678`
- Create account (jika pertama kali)

### 2. Create New Workflow
- Click **"New workflow"**
- Beri nama: **"WangKost Invoice to WhatsApp"**

---

## 📦 Step 3: Add Webhook Node (Trigger)

### 1. Add Node
- Click **"+"** atau **"Add first step"**
- Search: **"Webhook"**
- Select **"Webhook"** node

### 2. Configure Webhook
- **HTTP Method:** `POST`
- **Path:** `whatsapp-invoice`
- **Response Mode:** `When Last Node Finishes`
- **Response Code:** `200`

### 3. Copy Webhook URL
Akan muncul URL seperti:
```
http://localhost:5678/webhook/whatsapp-invoice
```

**Simpan URL ini** - akan dipakai di .env nanti!

### 4. Test Webhook (Optional)
Click **"Listen for test event"** lalu:

```bash
# Test dengan curl
curl -X POST http://localhost:5678/webhook/whatsapp-invoice \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "6281234567890",
  "tenantName": "Test User",
  "invoiceNumber": "INV-TEST-123",
  "paymentUrl": "https://example.com/pay",
  "pdfBase64": "JVBERi0xLjQK...",
  "dueDate": "2025-01-20",
  "amount": 1500000
}'
```

---

## 🔄 Step 4: Add Function Node (Process Data)

### 1. Add Function Node
- Click **"+"** after Webhook
- Search: **"Code"**
- Select **"Code"** node

### 2. Configure Function
- **Mode:** `Run Once for All Items`
- **Language:** `JavaScript`

### 3. Paste Code:

```javascript
// Extract data from webhook
const data = $input.item.json;

// Format phone number untuk WhatsApp API
// Jika format 08xxx → 628xxx
let phoneNumber = data.phoneNumber;
if (phoneNumber.startsWith('0')) {
  phoneNumber = '62' + phoneNumber.slice(1);
} else if (!phoneNumber.startsWith('62')) {
  phoneNumber = '62' + phoneNumber;
}

// Format amount dengan Rupiah
const formattedAmount = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
}).format(data.amount);

// Create WhatsApp message
const message = `🏠 *INVOICE PEMBAYARAN KOST*

Halo *${data.tenantName}*,

Ini adalah pengingat pembayaran kost Anda untuk bulan berikutnya:

📄 *Invoice:* ${data.invoiceNumber}
💰 *Jumlah:* ${formattedAmount}
📅 *Jatuh Tempo:* ${data.dueDate}

Silakan lakukan pembayaran sebelum tanggal jatuh tempo untuk menghindari denda.

🔗 *Link Pembayaran:*
${data.paymentUrl}

Invoice PDF terlampir di pesan ini.

Terima kasih! 🙏`;

// Return formatted data
return {
  json: {
    phoneNumber: phoneNumber,
    message: message,
    pdfBase64: data.pdfBase64,
    fileName: `Invoice_${data.invoiceNumber}.pdf`,
    caption: `Invoice Pembayaran Kost - ${data.tenantName}`
  }
};
```

---

## 📲 Step 5: Add WhatsApp Node

Ada beberapa pilihan WhatsApp API:

### **Option A: Fonnte (Recommended - Mudah & Murah)**

#### 1. Daftar Fonnte
- Go to: https://fonnte.com/
- Register & verify
- Top up minimal Rp 10.000
- Get API Token dari dashboard

#### 2. Add HTTP Request Node
- Click **"+"** after Function node
- Search: **"HTTP Request"**
- Select **"HTTP Request"** node

#### 3. Configure HTTP Request

**Settings:**
- **Method:** `POST`
- **URL:** `https://api.fonnte.com/send`

**Authentication:**
- **Authentication:** `Generic Credential Type`
- **Add Credential:**
  - **Name:** `Fonnte API`
  - **Type:** `Header Auth`
  - **Name:** `Authorization`
  - **Value:** `YOUR_FONNTE_TOKEN` (dari Fonnte dashboard)

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "target": "={{ $json.phoneNumber }}",
  "message": "={{ $json.message }}",
  "file": "data:application/pdf;base64,={{ $json.pdfBase64 }}",
  "filename": "={{ $json.fileName }}"
}
```

**Options:**
- Response Format: `JSON`

---

### **Option B: Wablas**

#### 1. Daftar Wablas
- Go to: https://wablas.com/
- Register & get device token

#### 2. Add HTTP Request Node
**Settings:**
- **Method:** `POST`
- **URL:** `https://pati.wablas.com/api/send-document`

**Headers:**
```json
{
  "Authorization": "YOUR_WABLAS_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "phone": "={{ $json.phoneNumber }}",
  "document": "data:application/pdf;base64,={{ $json.pdfBase64 }}",
  "caption": "={{ $json.message }}"
}
```

---

### **Option C: WhatsApp Business API (Official - Complex)**

Untuk production dengan volume besar:
- Perlu WhatsApp Business Account
- Perlu verifikasi Facebook Business
- Setup Meta Developer Account
- More complex tapi lebih reliable

---

## ✅ Step 6: Test Complete Workflow

### 1. Activate Workflow
- Click **"Active"** toggle di kanan atas
- Workflow sekarang live!

### 2. Get Webhook URL
Copy webhook URL dari Webhook node:
```
http://localhost:5678/webhook/whatsapp-invoice
```

### 3. Update .env
Update file `.env` di project:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-invoice
```

### 4. Test dari API

Restart Next.js server lalu test:

```bash
POST http://localhost:3000/api/invoices/generate
{
  "rentId": "your-rent-id"
}
```

**Expected Flow:**
1. ✅ Invoice generated
2. ✅ Data sent to n8n webhook
3. ✅ n8n process data
4. ✅ WhatsApp API called
5. ✅ Message + PDF received by tenant

---

## 📊 Step 7: Monitor & Debug

### In n8n Dashboard:

1. **View Executions:**
   - Click **"Executions"** tab
   - See all webhook calls
   - Check success/failed status

2. **Debug Failed Executions:**
   - Click on failed execution
   - See error details
   - Check which node failed

3. **View Logs:**
   - Each node shows input/output
   - Check if data formatted correctly
   - Verify WhatsApp API response

---

## 🎯 Complete n8n Workflow JSON

Save this as `wangkost-whatsapp.json` and import to n8n:

```json
{
  "name": "WangKost Invoice to WhatsApp",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-invoice",
        "responseMode": "whenLastNodeFinishes",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "whatsapp-invoice"
    },
    {
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Extract data\nconst data = $input.item.json;\n\n// Format phone\nlet phone = data.phoneNumber;\nif (phone.startsWith('0')) {\n  phone = '62' + phone.slice(1);\n}\n\n// Format message\nconst message = `🏠 *INVOICE PEMBAYARAN KOST*\\n\\nHalo *${data.tenantName}*,\\n\\n📄 *Invoice:* ${data.invoiceNumber}\\n💰 *Jumlah:* Rp ${data.amount.toLocaleString('id-ID')}\\n📅 *Jatuh Tempo:* ${data.dueDate}\\n\\n🔗 Link Pembayaran:\\n${data.paymentUrl}\\n\\nTerima kasih! 🙏`;\n\nreturn {\n  json: {\n    phoneNumber: phone,\n    message: message,\n    pdfBase64: data.pdfBase64,\n    fileName: `Invoice_${data.invoiceNumber}.pdf`\n  }\n};"
      },
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.fonnte.com/send",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "target",
              "value": "={{ $json.phoneNumber }}"
            },
            {
              "name": "message",
              "value": "={{ $json.message }}"
            },
            {
              "name": "file",
              "value": "data:application/pdf;base64,={{ $json.pdfBase64 }}"
            },
            {
              "name": "filename",
              "value": "={{ $json.fileName }}"
            }
          ]
        },
        "options": {}
      },
      "name": "Send WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "1",
          "name": "Fonnte API"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Process Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Data": {
      "main": [
        [
          {
            "node": "Send WhatsApp",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 🔐 Production Setup

### 1. Expose n8n ke Internet

**Option A: ngrok (Development)**
```bash
ngrok http 5678
```

Copy URL: `https://abc123.ngrok.io`

Update .env:
```env
N8N_WEBHOOK_URL=https://abc123.ngrok.io/webhook/whatsapp-invoice
```

**Option B: Deploy n8n (Production)**
- Deploy ke VPS (DigitalOcean, AWS, etc)
- Setup domain & SSL
- Use process manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start n8n with PM2
pm2 start n8n

# Auto-restart on boot
pm2 startup
pm2 save
```

### 2. Secure Webhook

Add authentication di Webhook node:
- **Header Auth Name:** `X-API-Key`
- **Header Auth Value:** `your-secret-key`

Update cron job untuk kirim header:
```javascript
await fetch(n8nWebhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "your-secret-key"  // Add this
  },
  body: JSON.stringify(data)
});
```

---

## 📝 Testing Checklist

- [ ] n8n installed & running
- [ ] Webhook node created
- [ ] Function node configured
- [ ] WhatsApp API configured (Fonnte/Wablas)
- [ ] Workflow activated
- [ ] Webhook URL updated di .env
- [ ] Test manual dengan curl
- [ ] Test dari invoice generation API
- [ ] Verify WhatsApp message received
- [ ] Verify PDF attachment received
- [ ] Check payment link clickable

---

## 🐛 Troubleshooting

### WhatsApp tidak terkirim?

**1. Check n8n Executions:**
- Go to n8n dashboard
- Check "Executions" tab
- Look for error messages

**2. Check Phone Number Format:**
```javascript
// Should be: 6281234567890 (country code + number)
// Not: 081234567890
// Not: +6281234567890
```

**3. Check PDF Base64:**
- Make sure not truncated
- Check if valid base64 string

**4. Check WhatsApp API Quota:**
- Fonnte: Check balance
- Wablas: Check device status

### Webhook not receiving data?

**1. Check URL:**
```bash
# Test webhook
curl -X POST http://localhost:5678/webhook/whatsapp-invoice \
-H "Content-Type: application/json" \
-d '{"test": "data"}'
```

**2. Check n8n Status:**
```bash
# Make sure n8n running
ps aux | grep n8n
```

**3. Check Workflow Active:**
- Toggle should be ON (green)

---

## 💡 Tips

1. **Test dengan nomor sendiri dulu** sebelum production
2. **Monitor executions** untuk track success rate
3. **Setup error notifications** di n8n
4. **Backup workflow** secara berkala (export JSON)
5. **Use environment variables** untuk credentials

---

## 📞 WhatsApp API Services Comparison

| Service | Price | Setup | Features |
|---------|-------|-------|----------|
| **Fonnte** | Rp 200/msg | Easy | File support, cheap |
| **Wablas** | Rp 300/msg | Easy | Multiple devices |
| **WA Business API** | Complex pricing | Hard | Official, reliable |

**Recommendation:** Start with **Fonnte** untuk testing & small scale.

---

## ✅ Success Indicator

Jika berhasil, tenant akan terima:
1. ✅ WhatsApp message dengan text invoice
2. ✅ PDF attachment (invoice dengan barcode)
3. ✅ Payment link yang bisa diklik
4. ✅ Pesan terformat rapi dengan emoji

---

**Next:** Test complete flow dari add tenant → wait for cron → receive WhatsApp! 🎉
