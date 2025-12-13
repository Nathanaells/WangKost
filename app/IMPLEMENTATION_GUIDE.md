# 🏠 WangKost - Complete Implementation Guide

## 📋 Table of Contents

1. [Flow Overview](#flow-overview)
2. [API Endpoints](#api-endpoints)
3. [Setup & Configuration](#setup--configuration)
4. [n8n Workflow Setup](#n8n-workflow-setup)
5. [Cron Job](#cron-job)

---

## 🔄 Flow Overview

### 1. Admin Adds Tenant to Room

```
Admin → Select Hostel → Select Room → Add Tenant
  ↓
Automatically creates:
  - Rent record (with additionals)
  - Updates room's tenant list
  - Updates tenant's rent list
  - Sets joinAt date
```

### 2. Automated Invoice Generation

```
Cron Job (runs daily at midnight)
  ↓
Check all active rents
  ↓
If 7 days before next payment date:
  - Generate invoice PDF with barcode
  - Create Midtrans payment link
  - Create transaction record
  - Send to n8n webhook
  ↓
n8n sends WhatsApp message with:
  - Invoice PDF
  - Payment link
  - Due date reminder
```

### 3. Payment Flow

```
Tenant receives WhatsApp
  ↓
Clicks payment link
  ↓
Pays via Midtrans
  ↓
Midtrans webhook → `/api/payment/webhook`
  ↓
Transaction status updated to PAID
```

---

## 🛠️ API Endpoints

### Auth

- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login admin

### Hostels

- `GET /api/hostels` - Get all hostels
- `POST /api/hostels` - Create hostel
- `GET /api/hostels/[hostelId]` - Get hostel details
- `PATCH /api/hostels/[hostelId]` - Update hostel
- `DELETE /api/hostels/[hostelId]` - Delete hostel

### Rooms

- `GET /api/hostels/[hostelId]/rooms` - Get all rooms in hostel
- `POST /api/hostels/[hostelId]/rooms` - Create room
- `GET /api/hostels/[hostelId]/rooms/[roomId]` - Get room details
- `PATCH /api/hostels/[hostelId]/rooms/[roomId]` - Update room
- `DELETE /api/hostels/[hostelId]/rooms/[roomId]` - Delete room

### **⭐ Add Tenant to Room (Main Feature)**

- `POST /api/hostels/[hostelId]/rooms/[roomId]/add-tenant`

  **Body:**

  ```json
  {
    "tenantId": "ObjectId",
    "joinAt": "2025-01-01" // optional, defaults to today
  }
  ```

  **Response:**

  ```json
  {
    "message": "Tenant added to room successfully",
    "data": {
      "rentId": "ObjectId",
      "totalPrice": 1500000,
      "joinAt": "2025-01-01T00:00:00.000Z"
    }
  }
  ```

### Tenants

- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/[tenantId]` - Get tenant details
- `PATCH /api/tenants/[tenantId]` - Update tenant
- `DELETE /api/tenants/[tenantId]` - Delete tenant

### Rents

- `GET /api/rents` - Get all rents
- `POST /api/rents` - Create rent manually (not recommended, use add-tenant instead)
- `GET /api/rents/[rentId]` - Get rent details
- `PATCH /api/rents/[rentId]` - Update rent (e.g., set leaveAt)

### Additionals

- `GET /api/additionals` - Get all additionals
- `POST /api/additionals` - Create additional
- `PATCH /api/additionals/[id]` - Update additional
- `DELETE /api/additionals/[id]` - Delete additional

### **⭐ Invoice Generation**

- `POST /api/invoices/generate`

  **Body:**

  ```json
  {
    "rentId": "ObjectId"
  }
  ```

  **Response:**

  ```json
  {
    "message": "Invoice generated successfully",
    "data": {
      "invoiceNumber": "INV-1234567890-rentId",
      "paymentUrl": "https://app.midtrans.com/snap/...",
      "paymentToken": "token123",
      "pdfBase64": "base64-encoded-pdf",
      "tenantPhone": "081234567890",
      "tenantEmail": "tenant@email.com"
    }
  }
  ```

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/[transactionId]` - Get transaction details

### **⭐ Payment Webhook (Midtrans)**

- `POST /api/payment/webhook` - Handle Midtrans payment notification

  This endpoint is called automatically by Midtrans when payment status changes.

### **⭐ Cron Job**

- `GET /api/cron/init` - Initialize cron jobs (call once when server starts)

---

## ⚙️ Setup & Configuration

### 1. Install Dependencies

```bash
npm install node-cron puppeteer bwip-js midtrans-client @types/node-cron @types/bwip-js
```

### 2. Environment Variables

Create `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/wangkost

# JWT
JWT_SECRET=your-jwt-secret-key-here

# Midtrans
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# n8n Webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/whatsapp-invoice

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Start Cron Jobs

Call this endpoint once when your server starts:

```bash
curl http://localhost:3000/api/cron/init
```

Or add to your deployment script:

```bash
npm run build
npm start &
sleep 5
curl http://localhost:3000/api/cron/init
```

---

## 📱 n8n Workflow Setup

### Create n8n Workflow for WhatsApp Notification

1. **Webhook Node** (Trigger)

   - Method: POST
   - Path: `/webhook/whatsapp-invoice`

2. **Function Node** (Process Data)

   ```javascript
   const phoneNumber = $input.item.json.phoneNumber;
   const tenantName = $input.item.json.tenantName;
   const invoiceNumber = $input.item.json.invoiceNumber;
   const paymentUrl = $input.item.json.paymentUrl;
   const pdfBase64 = $input.item.json.pdfBase64;
   const dueDate = $input.item.json.dueDate;
   const amount = $input.item.json.amount;

   // Format phone number (remove leading 0, add 62)
   const formattedPhone = phoneNumber.startsWith("0")
     ? "62" + phoneNumber.slice(1)
     : phoneNumber;

   const message = `Halo ${tenantName},\n\nIni adalah pengingat pembayaran kost Anda:\n\n📄 Invoice: ${invoiceNumber}\n💰 Jumlah: Rp ${amount.toLocaleString(
     "id-ID"
   )}\n📅 Jatuh Tempo: ${dueDate}\n\n🔗 Link Pembayaran:\n${paymentUrl}\n\nMohon segera lakukan pembayaran sebelum tanggal jatuh tempo.\n\nTerima kasih!`;

   return {
     phoneNumber: formattedPhone,
     message: message,
     pdfBase64: pdfBase64,
     fileName: `Invoice_${invoiceNumber}.pdf`,
   };
   ```

3. **WhatsApp Node** (Send Message)

   - Use your WhatsApp Business API or service
   - Send message with PDF attachment
   - Common services:
     - **Fonnte**
     - **Wablas**
     - **WhatsApp Business API**

4. Example with Fonnte:
   ```javascript
   // HTTP Request Node
   Method: POST
   URL: https://api.fonnte.com/send
   Headers:
     Authorization: YOUR_FONNTE_TOKEN
   Body:
     {
       "target": "{{$json.phoneNumber}}",
       "message": "{{$json.message}}",
       "file": "data:application/pdf;base64,{{$json.pdfBase64}}",
       "filename": "{{$json.fileName}}"
     }
   ```

---

## ⏰ Cron Job Details

### Schedule

- **Frequency:** Daily at 00:00 (midnight)
- **Pattern:** `0 0 * * *`

### What it does:

1. Fetches all active rents (`leaveAt` is null)
2. For each rent:
   - Calculates next payment date (1 month from joinAt)
   - Checks if it's exactly 7 days before payment
   - If yes:
     - Generates invoice PDF with barcode
     - Creates Midtrans payment link
     - Creates transaction record
     - Sends to n8n webhook

### Manual Trigger

If you need to test or manually trigger invoice generation:

```bash
POST /api/invoices/generate
{
  "rentId": "your-rent-id"
}
```

---

## 🎯 Usage Example

### Complete Flow: Adding Tenant

1. **Create Hostel**

```bash
POST /api/hostels
{
  "name": "Kost Sejahtera",
  "address": "Jl. Sudirman No. 123",
  "maxRoom": 10,
  "description": "Kost nyaman dan aman"
}
```

2. **Add Room to Hostel**

```bash
POST /api/hostels/[hostelId]/rooms
{
  "fixedCost": 1000000
}
```

3. **Create Tenant**

```bash
POST /api/tenants
{
  "name": "John Doe",
  "email": "john@example.com",
  "birthday": "1995-01-01",
  "phoneNumber": "081234567890",
  "isActive": true
}
```

4. **Add Tenant to Room** (⭐ Main Action)

```bash
POST /api/hostels/[hostelId]/rooms/[roomId]/add-tenant
{
  "tenantId": "[tenantId]",
  "joinAt": "2025-01-15"
}
```

This automatically:

- Creates rent record
- Adds all additionals to rent
- Updates room's tenant list
- Sets tenant as active

5. **Wait for Cron Job**
   - 7 days before next month (Feb 15), the system will:
     - Generate invoice PDF
     - Create Midtrans payment
     - Send WhatsApp via n8n

---

## 📝 Notes

### PDF Invoice Features

- ✅ Hostel & tenant information
- ✅ Itemized costs (room + additionals)
- ✅ Total amount
- ✅ Due date
- ✅ Barcode with invoice number
- ✅ Payment link button

### Midtrans Integration

- Supports all Midtrans payment methods
- Automatic status updates via webhook
- Transaction history tracking

### WhatsApp Notification

- Sent 7 days before due date
- Includes PDF invoice
- Includes payment link
- Reminder message

---

## 🚀 Deployment Checklist

- [ ] Set up MongoDB database
- [ ] Configure environment variables
- [ ] Set up Midtrans account
- [ ] Set up n8n instance
- [ ] Configure WhatsApp Business API
- [ ] Test cron job manually
- [ ] Set up Midtrans webhook URL
- [ ] Test complete flow with real payment
- [ ] Monitor logs for errors

---

## 🆘 Troubleshooting

### Cron Job Not Running

- Check if `/api/cron/init` was called
- Check server logs
- Verify server timezone

### PDF Not Generated

- Check Puppeteer installation
- Verify barcode generation
- Check temp directory permissions

### WhatsApp Not Sent

- Verify n8n webhook URL
- Check n8n workflow logs
- Verify WhatsApp API credentials

### Payment Not Updated

- Verify Midtrans webhook URL in dashboard
- Check webhook signature
- Monitor `/api/payment/webhook` logs

---

**Happy Coding! 🎉**
