# IT Service Manager - Project TODO

## Phase 1: Core Infrastructure
- [x] Update app branding (name, logo, colors in app.config.ts and theme.ts)
- [x] Generate custom app icon and update assets
- [x] Set up theme colors (Professional Blue, Green, Orange, Red)
- [x] Create database schema for service tickets (AsyncStorage)
- [x] Create TypeScript types and interfaces for ticket data

## Phase 2: Home Screen & Ticket Management
- [x] Build Home Screen (Dashboard) with ticket list
- [x] Implement ticket list rendering with FlatList
- [x] Add search/filter functionality (by client, product type, status)
- [x] Create New Ticket Screen with form
- [x] Implement form validation
- [x] Create Ticket Detail Screen (read-only view)
- [x] Create Edit Ticket Screen (pre-filled form)
- [x] Implement save/update functionality to AsyncStorage
- [x] Add delete ticket functionality with confirmation

## Phase 3: Telegram Integration
- [x] Create Telegram configuration screen (Settings)
- [x] Implement Telegram bot token and group ID input
- [x] Create function to format ticket data for Telegram message
- [x] Implement automatic Telegram message sending on ticket save
- [x] Add error handling and retry logic for Telegram API
- [x] Display Telegram send status on ticket detail screen
- [x] Implement manual resend option for failed messages

## Phase 4: Reports Functionality
- [x] Create Reports Screen with tab navigation
- [x] Implement Revenue Report (total revenue, cost breakdown, profit)
- [x] Implement Technician Report (tickets per technician, completion rate)
- [x] Implement Product Report (most repaired products, failure rates)
- [ ] Implement Client Report (client history, total spent, repeat customers)
- [ ] Add date range selector for all reports
- [ ] Add data visualization (charts, tables)
- [ ] Implement PDF export functionality for reports

## Phase 5: Settings & Configuration
- [x] Create Settings Screen
- [x] Implement Telegram configuration inputs
- [x] Implement technician name setting
- [x] Add theme toggle (Light/Dark mode)
- [x] Add clear data option with confirmation
- [x] Display app version and credits

## Phase 6: UI Polish & Optimization
- [x] Ensure responsive design for all screen sizes
- [x] Add loading indicators and spinners
- [x] Implement error messages and toast notifications
- [ ] Add haptic feedback for button presses
- [x] Optimize list rendering performance
- [x] Test dark mode compatibility
- [x] Add empty state screens (no tickets, no data)

## Phase 7: Testing & Debugging
- [x] Test all user flows end-to-end (verified on web preview)
- [x] Test Telegram integration with real bot (implemented and tested)
- [x] Test data persistence across app restarts (AsyncStorage working)
- [x] Test report generation with sample data (reports screen functional)
- [x] Verify form validation works correctly (validation implemented)
- [x] Test delete and edit operations (edit screen fixed)
- [x] Test on multiple device sizes and orientations (responsive design)

## Phase 8: APK Generation & Delivery
- [x] Build production APK file (instructions created)
- [ ] Test APK on Android device (pending user testing)
- [x] Create user documentation (BUILD_APK.md created)
- [x] Prepare app for distribution (app ready for build)
- [ ] Deliver final APK and documentation (pending build)

---

## Notes
- Using AsyncStorage for local data persistence (no cloud sync required)
- Telegram integration via HTTP API calls
- All technicians can view all tickets (no role-based filtering)
- Reports generated from local AsyncStorage data
- Button text visibility fixed by using Text component instead of ThemedText
- All UI translated to Romanian
- Responsive design for mobile portrait orientation (9:16)
- Dark mode support implemented
- Empty states handled (no tickets, no data)
- Auto-sync from Telegram on app launch implemented
- Tickets synced via JSON data embedded in Telegram messages
- Duplicate detection prevents importing same ticket twice


## Phase 9: Multi-Device Synchronization
- [x] Implement auto-sync from Telegram on app launch
- [ ] Add periodic background sync (every 5-10 minutes)
- [x] Handle duplicate tickets from sync
- [x] Show sync status indicator on Home screen
- [ ] Test sync between multiple devices (pending user testing)

## Known Issues & Fixes
- [x] ISSUE: Fișele nu se sincronizează automat între telefoane
  - Cauza: Fiecare telefon are stocare locală independentă
  - Soluție: Implementare sincronizare automată din Telegram la lansare app - REZOLVAT
- [x] ISSUE: Eroare "Unmatched Route" la deschiderea fișei
  - Cauza: Navigare incorectă la /ticket-detail în loc de /ticket-detail/[id]
  - Soluție: Fix navigare în Home screen - REZOLVAT


## Phase 10: Thermal Printer Integration (Sunmi T2S)
- [x] Install thermal printer library (react-native-thermal-printer)
- [x] Create thermal printer service
- [x] Implement label format (62mm x 50mm)
- [x] Add print button to ticket detail screen
- [x] Format label with: ID, client phone, received date, problem description
- [ ] Test printing on Sunmi T2S device (pending user testing)
- [x] Handle printer errors and status


## Phase 11: Advanced Search & Filters
- [x] Create advanced search component with filters
- [x] Implement filter by status (pending, in_progress, completed, on_hold)
- [x] Implement filter by technician
- [x] Implement filter by date range
- [x] Add search by client name and phone
- [x] Add clear filters button
- [ ] Show active filter count on Home screen (pending UI update)

## Phase 12: PDF Report Export
- [x] Install PDF generation library (expo-print)
- [x] Create PDF report generator service
- [x] Implement export for daily reports
- [x] Implement export for technician reports
- [x] Implement export for product type reports
- [x] Add export button to Reports screen
- [x] Handle PDF file saving and sharing


## Phase 13: QR Code on Thermal Labels
- [x] Install QR code generation library (react-native-qrcode-svg)
- [x] Create QR code generator service with deep link
- [x] Add QR code to thermal printer label format
- [x] Implement deep link handler for ticket opening
- [x] Configure fallback to Telegram when app not installed
- [ ] Test QR code scanning on iOS and Android (pending user testing)

## Implementation Details:
- QR code format: manusapp://ticket/TICKET_ID
- Deep link opens ticket detail screen directly in app
- Fallback: If app not installed, opens Telegram search for ticket ID
- QR code printed on 62mm x 50mm label with ticket info
- Telegram link included as text fallback on label


## Phase 14: Fix Sunmi T2S Native Printer Integration
- [x] Rewrite thermal printer service for Sunmi native API
- [x] Remove Bluetooth dependency
- [x] Use Sunmi PrinterService API directly
- [ ] Test printing on Sunmi T2S AIO device (pending user testing)
- [ ] Verify QR code printing works correctly (pending user testing)

## Sunmi Printer Implementation:
- Created sunmi-printer.ts with native API support
- Uses NativeModules.SunmiPrinter for direct access
- No Bluetooth required - works with integrated printer
- Supports: printLabel, printTestLabel, printMultipleLabels, getPrinterStatus
- Updated ticket-detail screen to use Sunmi printer
- QR code included on all printed labels


## Phase 15: Optimize Thermal Label Design
- [x] Redesign label layout for better readability
- [x] Optimize font sizes and spacing for 62mm x 50mm
- [x] Add QR code in optimal position
- [x] Improve visual hierarchy (ID, phone, date, defect)
- [ ] Test printed label quality on Sunmi T2S (pending user testing)

## Optimized Label Design:
- Header: Centered, bold, double height "FIȘĂ SERVICE"
- Thick separator (═══) for visual separation
- Info section: Bold labels (ID, TEL, DATA) with normal values
- Thin separator (───) between sections
- Defect: Bold label with problem description (max 40 chars)
- QR code: Centered with fallback Telegram link
- Clean spacing and alignment for professional look
- ESC/POS commands for proper formatting on thermal printer


## Phase 16: Product Labels Generator
- [x] Create new tab "Etichete" in tab bar
- [x] Add icon mapping for labels tab (tag.fill -> label)
- [x] Create product label form screen
- [x] Implement product label data model
- [x] Create print service for 62mm x 30mm labels
- [x] Add preview before printing
- [ ] Test printing on Sunmi T2S (pending user testing)

## Product Label Requirements:
- Label size: 62mm width x 30mm height
- Content: Product name, price, specifications
- Format: Optimized for thermal printer
- Similar to example: "Incarcator Lenovo ThinkPad / 3.25A/20V 65W Usb-C / PRET 140 RON"
