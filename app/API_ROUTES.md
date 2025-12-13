# API Routes Documentation

## Overview
API routes telah direorganisasi untuk struktur yang lebih bersih dan RESTful.

## Base URL
`/api`

---

## Authentication Routes

### Auth - Register
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register new owner account
- **Auth Required:** No
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "phoneNumber": "string"
  }
  ```

### Auth - Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Login owner account
- **Auth Required:** No
- **Body:**
  ```json
  {
    "phoneNumber": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "string"
  }
  ```

---

## Hostels Routes

### Get All Hostels
- **Endpoint:** `GET /api/hostels`
- **Description:** Get all hostels owned by authenticated user
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Create Hostel
- **Endpoint:** `POST /api/hostels`
- **Description:** Create a new hostel
- **Auth Required:** Yes
- **Headers:** `x-owner-id`
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "address": "string",
    "maxRoom": "number"
  }
  ```

### Get Single Hostel
- **Endpoint:** `GET /api/hostels/[hostelId]`
- **Description:** Get hostel details by ID
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Update Hostel
- **Endpoint:** `PATCH /api/hostels/[hostelId]`
- **Description:** Update hostel information
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Delete Hostel
- **Endpoint:** `DELETE /api/hostels/[hostelId]`
- **Description:** Delete a hostel
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Rooms Routes

### Get All Rooms for Hostel
- **Endpoint:** `GET /api/hostels/[hostelId]/rooms`
- **Description:** Get all rooms in a hostel
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Create Room
- **Endpoint:** `POST /api/hostels/[hostelId]/rooms`
- **Description:** Create a new room in a hostel
- **Auth Required:** Yes
- **Headers:** `x-owner-id`
- **Body:**
  ```json
  {
    "fixedCost": "number"
  }
  ```

### Get Single Room
- **Endpoint:** `GET /api/hostels/[hostelId]/rooms/[roomId]`
- **Description:** Get room details by ID
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Update Room
- **Endpoint:** `PATCH /api/hostels/[hostelId]/rooms/[roomId]`
- **Description:** Update room information
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Delete Room
- **Endpoint:** `DELETE /api/hostels/[hostelId]/rooms/[roomId]`
- **Description:** Delete a room
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Tenants Routes

### Get All Tenants
- **Endpoint:** `GET /api/tenants`
- **Description:** Get all tenants
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Create Tenant
- **Endpoint:** `POST /api/tenants`
- **Description:** Create a new tenant
- **Auth Required:** Yes
- **Headers:** `x-owner-id`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "birthday": "Date",
    "phoneNumber": "string",
    "isActive": "boolean"
  }
  ```

### Get Single Tenant
- **Endpoint:** `GET /api/tenants/[tenantId]`
- **Description:** Get tenant details by ID
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Update Tenant
- **Endpoint:** `PATCH /api/tenants/[tenantId]`
- **Description:** Update tenant information
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Delete Tenant
- **Endpoint:** `DELETE /api/tenants/[tenantId]`
- **Description:** Delete a tenant
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Rents Routes

### Get All Rents
- **Endpoint:** `GET /api/rents`
- **Description:** Get all rents for owner's hostels
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Create Rent
- **Endpoint:** `POST /api/rents`
- **Description:** Create a new rent
- **Auth Required:** Yes
- **Headers:** `x-owner-id`
- **Body:**
  ```json
  {
    "price": "number",
    "roomId": "ObjectId",
    "tenantId": "ObjectId",
    "joinAt": "Date (optional)"
  }
  ```

### Get Single Rent
- **Endpoint:** `GET /api/rents/[rentId]`
- **Description:** Get rent details by ID
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Update Rent
- **Endpoint:** `PATCH /api/rents/[rentId]`
- **Description:** Update rent (e.g., set leaveAt date, update price)
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Rent Additionals Routes

### Get Rent Additionals
- **Endpoint:** `GET /api/rents/[rentId]/rentAdditionals`
- **Description:** Get all additionals for a rent
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Add Additional to Rent
- **Endpoint:** `POST /api/rents/[rentId]/rentAdditionals`
- **Description:** Add an additional to a rent
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Update Rent Additional
- **Endpoint:** `PATCH /api/rents/[rentId]/rentAdditionals/[id]`
- **Description:** Update a specific additional in a rent
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Delete Rent Additional
- **Endpoint:** `DELETE /api/rents/[rentId]/rentAdditionals/[id]`
- **Description:** Remove an additional from a rent
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Additionals Routes

### Get All Additionals
- **Endpoint:** `GET /api/additionals`
- **Description:** Get all available additionals
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Create Additional
- **Endpoint:** `POST /api/additionals`
- **Description:** Create a new additional service/item
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Update Additional
- **Endpoint:** `PATCH /api/additionals/[id]`
- **Description:** Update an additional
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Delete Additional
- **Endpoint:** `DELETE /api/additionals/[id]`
- **Description:** Delete an additional
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Transactions Routes

### Get All Transactions
- **Endpoint:** `GET /api/transactions`
- **Description:** Get all transactions
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

### Get Single Transaction
- **Endpoint:** `GET /api/transactions/[transactionId]`
- **Description:** Get transaction details by ID
- **Auth Required:** Yes
- **Headers:** `x-owner-id`

---

## Migration Guide

### Old → New Endpoints

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `/api/admin/register` | `/api/auth/register` |
| `/api/admin/login` | `/api/auth/login` |
| `/api/hostel` | `/api/hostels` |
| `/api/hostel/create-hostel` | `/api/hostels` (POST) |
| `/api/hostel/[id]` | `/api/hostels/[hostelId]` |
| `/api/hostel/[id]/add-room` | `/api/hostels/[hostelId]/rooms` (POST) |
| `/api/room/[id]` | `/api/hostels/[hostelId]/rooms/[roomId]` |
| `/api/tenants/create-tenant` | `/api/tenants` (POST) |
| `/api/rent` | `/api/rents` |
| `/api/rent/create-rent` | `/api/rents` (POST) |
| `/api/rent/[id]` | `/api/rents/[rentId]` |

### Notes
- All endpoints now use consistent RESTful naming (plural nouns)
- Nested resources are properly nested in URL structure
- All CRUD operations are consolidated in single route files
- Authentication header remains `x-owner-id`
