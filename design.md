# IT Service Manager - Design Documentation

## Overview
A mobile application for managing IT service tickets with multi-technician support, Telegram integration, and comprehensive reporting capabilities.

---

## Screen List

### 1. **Home Screen (Dashboard)**
- **Purpose**: Overview of all service tickets and quick actions
- **Content**: 
  - List of all service tickets (scrollable)
  - Filter/Search by client name, product type, or status
  - Quick stats (total tickets, pending, completed today)
  - Floating action button to create new ticket

### 2. **New/Edit Ticket Screen**
- **Purpose**: Create or edit a service ticket
- **Content**:
  - Client Information (name, phone, email)
  - Product Selection (dropdown: Laptop, PC, Phone, Printer, GPS, TV, Box, Tablet)
  - Product Details (model, serial number)
  - Problem Description (text area)
  - Diagnostic (text area)
  - Solution Applied (text area)
  - Cost/Price (numeric input)
  - Technician Assignment (dropdown, auto-filled with current user)
  - Status (dropdown: Pending, In Progress, Completed, On Hold)
  - Date Received (date picker)
  - Date Delivered (date picker, optional)
  - Save Button (saves to local DB and sends to Telegram)
  - Cancel Button

### 3. **Ticket Detail Screen**
- **Purpose**: View full details of a single ticket
- **Content**:
  - All ticket information displayed (read-only or editable)
  - Edit Button (navigate to edit screen)
  - Delete Button (with confirmation)
  - Telegram Status (shows if sent, resend option)
  - Timeline/History (when created, modified, completed)

### 4. **Reports Screen**
- **Purpose**: View various reports and analytics
- **Tabs/Sections**:
  - **Revenue Report**: Total revenue, cost breakdown, profit margin by date range
  - **Technician Report**: Tickets per technician, completion rate, average cost
  - **Product Report**: Most repaired products, failure rates by type
  - **Client Report**: Client history, total spent, repeat customers
  - **Date Range Selector**: Filter reports by week, month, custom range
  - **Export Button**: Export reports as PDF or text

### 5. **Settings Screen**
- **Purpose**: Configure app settings
- **Content**:
  - Telegram Bot Token (input field, masked)
  - Telegram Group ID (input field)
  - Technician Name (auto-filled, editable)
  - App Theme (Light/Dark mode toggle)
  - Clear Data (with confirmation)
  - About (app version, credits)

---

## Primary Content and Functionality

### Service Ticket Data Model
```
Ticket {
  id: UUID
  clientName: string
  clientPhone: string
  clientEmail: string
  productType: enum (Laptop, PC, Phone, Printer, GPS, TV, Box, Tablet)
  productModel: string
  productSerialNumber: string
  problemDescription: string
  diagnostic: string
  solutionApplied: string
  cost: number
  status: enum (Pending, In Progress, Completed, On Hold)
  technicianName: string
  dateReceived: date
  dateDelivered: date (nullable)
  createdAt: timestamp
  updatedAt: timestamp
  telegramSent: boolean
  telegramMessageId: string (nullable)
}
```

### Key User Flows

#### Flow 1: Create New Ticket
1. User taps "+" button on Home Screen
2. Navigates to New Ticket Screen
3. Fills in all required fields
4. Taps "Save"
5. Ticket is saved to local database
6. Ticket is automatically sent to Telegram group
7. Success notification appears
8. User returns to Home Screen, sees new ticket in list

#### Flow 2: View and Edit Ticket
1. User taps a ticket from Home Screen list
2. Navigates to Ticket Detail Screen
3. User taps "Edit" button
4. Navigates to Edit Ticket Screen (pre-filled with existing data)
5. User modifies fields
6. Taps "Save"
7. Ticket is updated in database
8. Updated ticket is sent to Telegram (or marked as updated)
9. User returns to Home Screen

#### Flow 3: View Reports
1. User taps "Reports" tab
2. Selects report type (Revenue, Technician, Product, Client)
3. Optionally selects date range
4. Report is generated and displayed with charts/tables
5. User can tap "Export" to save as PDF

#### Flow 4: Configure Telegram
1. User navigates to Settings
2. Enters Telegram Bot Token and Group ID
3. Taps "Save"
4. Settings are saved locally
5. Future tickets will be sent to this group

---

## Key User Flows (Visual)

### Home Screen → New Ticket → Telegram
```
Home Screen
    ↓ (tap +)
New Ticket Screen
    ↓ (fill form, tap Save)
Database (AsyncStorage)
    ↓ (async)
Telegram API
    ↓
Telegram Group
```

### Home Screen → View/Edit → Update
```
Home Screen
    ↓ (tap ticket)
Ticket Detail
    ↓ (tap Edit)
Edit Ticket Screen
    ↓ (modify, tap Save)
Database (AsyncStorage)
    ↓ (async)
Telegram API (resend)
    ↓
Telegram Group
```

---

## Color Choices

### Brand Colors (Professional IT Service Theme)
- **Primary**: `#0066CC` (Professional Blue) - Main actions, buttons, highlights
- **Secondary**: `#00A86B` (Success Green) - Completed status, positive indicators
- **Accent**: `#FF6B35` (Alert Orange) - Pending items, warnings
- **Danger**: `#DC143C` (Crimson Red) - Delete actions, errors
- **Background**: `#F8F9FA` (Light Gray) - Main background
- **Surface**: `#FFFFFF` (White) - Cards, modals
- **Text Primary**: `#1A1A1A` (Dark Gray) - Main text
- **Text Secondary**: `#666666` (Medium Gray) - Secondary text, labels
- **Border**: `#E0E0E0` (Light Border) - Dividers, input borders
- **Status Colors**:
  - Pending: `#FFA500` (Orange)
  - In Progress: `#0066CC` (Blue)
  - Completed: `#00A86B` (Green)
  - On Hold: `#FF6B35` (Orange-Red)

---

## Navigation Structure

```
Tab Navigation (Bottom Tabs):
├── Home (House icon)
│   ├── Ticket List
│   ├── New Ticket (modal)
│   └── Ticket Detail
├── Reports (Chart icon)
│   ├── Revenue Report
│   ├── Technician Report
│   ├── Product Report
│   └── Client Report
└── Settings (Gear icon)
    ├── Telegram Configuration
    ├── Technician Settings
    └── App Settings
```

---

## Design Principles

1. **Mobile-First**: Optimized for portrait orientation, one-handed usage
2. **iOS-Style**: Clean, minimal interface following Apple HIG
3. **Accessibility**: Large touch targets (min 44pt), clear labels
4. **Performance**: Smooth scrolling, instant feedback on actions
5. **Data Integrity**: Confirmation dialogs for destructive actions
6. **Offline-First**: Works without internet, syncs when available

---

## Typography & Spacing

- **Title**: 28pt, Bold (screen headers)
- **Subtitle**: 20pt, Semibold (section headers)
- **Body**: 16pt, Regular (main text)
- **Caption**: 14pt, Regular (secondary text, labels)
- **Small**: 12pt, Regular (hints, metadata)

**Spacing Grid**: 8pt increments
- Padding: 16pt (standard), 24pt (large sections)
- Gaps: 8pt (tight), 12pt (normal), 16pt (spacious)
- Corner Radius: 12pt (buttons, inputs), 16pt (cards, modals)

---

## Component Specifications

### Buttons
- **Primary Button**: Blue background, white text, 44pt height, 12pt corner radius
- **Secondary Button**: Light gray background, blue text, 44pt height, 12pt corner radius
- **Danger Button**: Red background, white text, 44pt height, 12pt corner radius

### Input Fields
- **Text Input**: 44pt height, 12pt corner radius, light gray border, 12pt padding
- **Dropdown**: Same as text input, with chevron icon
- **Date Picker**: Native iOS/Android date picker

### Cards
- **Ticket Card**: White background, 16pt corner radius, shadow, 12pt padding, 12pt margin between cards

### Status Badge
- **Pending**: Orange background, white text, 8pt corner radius, 6pt padding
- **In Progress**: Blue background, white text, 8pt corner radius, 6pt padding
- **Completed**: Green background, white text, 8pt corner radius, 6pt padding
- **On Hold**: Red background, white text, 8pt corner radius, 6pt padding
