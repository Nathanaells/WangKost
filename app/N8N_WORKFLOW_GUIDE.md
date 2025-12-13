# 🎨 n8n Workflow Visual Guide

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    n8n Workflow: Invoice to WhatsApp         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Webhook    │ ───> │   Function   │ ───> │   HTTP Req   │
│   (Trigger)  │      │  Process Data│      │Send WhatsApp │
└──────────────┘      └──────────────┘      └──────────────┘
     │                      │                      │
     │                      │                      │
     ▼                      ▼                      ▼
Receive from          Format phone          Send to Fonnte
Cron Job              Format message        with PDF
                      Prepare data          attachment
```

## 🔄 Data Flow

### Input (dari Cron Job):
```json
{
  "phoneNumber": "081234567890",
  "tenantName": "John Doe",
  "invoiceNumber": "INV-1234567890-67abc",
  "paymentUrl": "https://app.sandbox.midtrans.com/snap/...",
  "pdfBase64": "JVBERi0xLjQKJeLjz9MK...",
  "dueDate": "2025-01-20",
  "amount": 1500000
}
```

### After Function Node:
```json
{
  "phoneNumber": "6281234567890",
  "message": "🏠 *INVOICE PEMBAYARAN KOST*\n\nHalo *John Doe*...",
  "pdfBase64": "JVBERi0xLjQKJeLjz9MK...",
  "fileName": "Invoice_INV-1234567890-67abc.pdf"
}
```

### To WhatsApp API (Fonnte):
```json
{
  "target": "6281234567890",
  "message": "🏠 *INVOICE PEMBAYARAN KOST*...",
  "file": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "filename": "Invoice_INV-1234567890-67abc.pdf"
}
```

## 📱 WhatsApp Message Preview

```
┌─────────────────────────────────────┐
│  WangKost Admin                     │
├─────────────────────────────────────┤
│                                     │
│  🏠 *INVOICE PEMBAYARAN KOST*      │
│                                     │
│  Halo *John Doe*,                  │
│                                     │
│  Ini adalah pengingat pembayaran    │
│  kost Anda untuk bulan berikutnya: │
│                                     │
│  📄 *Invoice:*                     │
│  INV-1234567890-67abc              │
│                                     │
│  💰 *Jumlah:*                      │
│  Rp 1.500.000                      │
│                                     │
│  📅 *Jatuh Tempo:*                 │
│  20 Januari 2025                   │
│                                     │
│  🔗 *Link Pembayaran:*             │
│  https://app.sandbox.midtrans...   │
│                                     │
│  📎 Invoice_INV-123...pdf          │
│                                     │
│  Terima kasih! 🙏                  │
│                                     │
└─────────────────────────────────────┘
```

## 🎯 n8n Dashboard Screenshots Guide

### 1. Create Workflow
```
Click: "New workflow" button (top right)
Name: "WangKost Invoice to WhatsApp"
```

### 2. Add Webhook Node
```
1. Click "+" or "Add first step"
2. Search: "webhook"
3. Select: "Webhook"
4. Configure:
   - HTTP Method: POST
   - Path: whatsapp-invoice
   - Response Mode: When Last Node Finishes
5. Copy webhook URL that appears
```

### 3. Add Code Node
```
1. Click "+" after Webhook node
2. Search: "code"
3. Select: "Code"
4. Paste JavaScript code (from N8N_SETUP.md)
5. Test execution
```

### 4. Add HTTP Request Node
```
1. Click "+" after Code node
2. Search: "http request"
3. Select: "HTTP Request"
4. Configure:
   - Method: POST
   - URL: https://api.fonnte.com/send
   - Add Headers (Authorization)
   - Add Body (JSON with expressions)
```

### 5. Test Workflow
```
1. Click "Test workflow" button
2. Or use "Listen for test event" in Webhook
3. Send test data via curl
4. Check each node's output
5. Verify WhatsApp received
```

### 6. Activate Workflow
```
1. Toggle "Active" switch (top right)
2. Should turn green
3. Webhook now listening
4. Ready to receive from cron job
```

## 🔧 Node Configuration Details

### Webhook Node Settings
```yaml
HTTP Method: POST
Path: whatsapp-invoice
Authentication: None (can add later)
Response:
  Mode: When Last Node Finishes
  Code: 200
  Data: Execution Data
Options:
  Binary Data: false
```

### Code Node Settings
```yaml
Mode: Run Once for All Items
Language: JavaScript
Continue On Fail: false
```

### HTTP Request Node Settings (Fonnte)
```yaml
Method: POST
URL: https://api.fonnte.com/send
Authentication: Header Auth
  Name: Authorization
  Value: [Your Fonnte Token]
Headers:
  Content-Type: application/json
Body:
  Content Type: JSON
  Specify Body: Using Fields
  Fields:
    - target: ={{ $json.phoneNumber }}
    - message: ={{ $json.message }}
    - file: data:application/pdf;base64,={{ $json.pdfBase64 }}
    - filename: ={{ $json.fileName }}
Response:
  Response Format: JSON
```

## 📊 Execution Monitoring

### Success Execution
```
✅ Webhook: Received data
✅ Code: Processed successfully
✅ HTTP Request: 200 OK from Fonnte
   Response: { "status": true, "message": "Sent" }
```

### Failed Execution Examples

**Error 1: Invalid Phone Number**
```
❌ HTTP Request: 400 Bad Request
   Error: "Invalid phone number format"
   
Fix: Check phone formatting in Code node
```

**Error 2: PDF Too Large**
```
❌ HTTP Request: 413 Payload Too Large
   Error: "File size exceeds limit"
   
Fix: Optimize PDF generation or compress
```

**Error 3: Insufficient Balance**
```
❌ HTTP Request: 402 Payment Required
   Error: "Insufficient balance"
   
Fix: Top up Fonnte account
```

## 🎓 Learning Resources

### n8n Documentation
- Webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- Code: https://docs.n8n.io/code-examples/
- HTTP Request: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/

### Fonnte API
- Docs: https://fonnte.com/api
- Dashboard: https://fonnte.com/dashboard

### WhatsApp Formatting
- Bold: *text*
- Italic: _text_
- Strikethrough: ~text~
- Monospace: ```text```

## 💡 Pro Tips

1. **Use Test Phone Number:** Test dengan nomor sendiri dulu
2. **Monitor Balance:** Set alert untuk low balance
3. **Error Handling:** Add error notification node
4. **Rate Limiting:** Add delay node jika banyak tenant
5. **Backup Workflow:** Export JSON secara berkala
6. **Use Variables:** Store credentials di n8n variables
7. **Log Everything:** Enable verbose logging untuk debugging

## 🔍 Debug Checklist

Jika WhatsApp tidak terkirim:

```
[ ] n8n workflow active (toggle ON)?
[ ] Webhook URL correct in .env?
[ ] Fonnte token valid?
[ ] Phone number format correct (62xxx)?
[ ] PDF base64 valid?
[ ] Fonnte balance sufficient?
[ ] Check n8n execution logs
[ ] Test webhook with curl
[ ] Verify Fonnte API response
```

## 📞 Quick Test Command

```bash
# Test n8n webhook
curl -X POST http://localhost:5678/webhook/whatsapp-invoice \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "081234567890",
  "tenantName": "Test User",
  "invoiceNumber": "INV-TEST-123",
  "paymentUrl": "https://midtrans.com/test",
  "pdfBase64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iag==",
  "dueDate": "2025-01-20",
  "amount": 1500000
}'
```

Expected: WhatsApp message + PDF received in ~2-5 seconds.

---

**Ready to test!** Follow N8N_SETUP.md untuk step-by-step implementation. 🚀
