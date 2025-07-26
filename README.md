# Polymer Trading Management System

A comprehensive trading management system for polymer businesses with real-time WhatsApp notifications and Google Sheets integration.

## ✨ Features

- **Deal Registration**: Streamlined form with autocomplete for customers, suppliers, and products
- **WhatsApp Integration**: Automatic notifications to accounts, logistics, and management teams
- **Google Sheets Sync**: Bi-directional sync with your existing Google Sheets
- **Inventory Management**: Real-time stock tracking and management
- **Analytics Dashboard**: Business insights and performance metrics
- **Mobile-Responsive**: Works perfectly on all devices
- **Professional Animations**: Smooth, polished user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env` (already configured)
   - Update WhatsApp and Google Sheets credentials if needed

3. **Initialize database**
   ```bash
   npm run seed
   ```

4. **Start development servers**
   
   Terminal 1 - Frontend:
   ```bash
   npm run dev
   ```
   
   Terminal 2 - Backend:
   ```bash
   npm run server
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📱 Usage

### Register a New Deal
1. Navigate to "New Deal" tab
2. Fill in customer details (autocomplete available)
3. Enter sale quantity and rate
4. Select product (autocomplete with details)
5. Choose material source (new purchase or inventory)
6. Add purchase details for new material
7. Submit - automatic WhatsApp notifications sent!

### WhatsApp Notifications
The system automatically sends customized messages to:
- **Accounts Team**: Detailed financial information
- **Logistics Team**: Shipping and warehouse details  
- **Management**: Executive summary with all details

### Google Sheets Integration
- All deals automatically sync to your Google Sheets
- Data follows the exact column structure you specified
- Real-time bidirectional sync capability

## 🛠 Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **Integrations**: WhatsApp Business API, Google Sheets API
- **Animations**: Framer Motion for professional UI transitions

## 📊 Data Structure

### Deal Registration Flow
1. **Basic Info**: Date, customer, quantity, rate, delivery terms
2. **Product Selection**: Auto-filled grade, company, specific grade details
3. **Material Source**: New purchase or existing inventory
4. **Comments**: Sale, purchase, and final notes
5. **Automatic Actions**: WhatsApp notifications + Google Sheets sync

### Pre-loaded Data
- ✅ **76 Customers** (Sale Parties)
- ✅ **86 Suppliers** (Purchase Parties) 
- ✅ **320+ Products** (Complete catalog with grades)

## 🔧 Configuration

### WhatsApp API Setup
- Phone Number ID: Configured in `.env`
- Recipients: 4 numbers for different teams
- Custom message templates for each recipient type

### Google Sheets Setup
- Service account authentication
- Automatic sheet structure matching
- Support for multiple sheet tabs (Main, Products, Inventory, etc.)

## 🎨 UI/UX Features

- **Smooth Animations**: Page transitions, form interactions, loading states
- **Professional Design**: Clean, minimalist interface 
- **Mobile-First**: Responsive design for all screen sizes
- **Error Handling**: Clear error messages with smooth animations
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Success/error feedback with animation

## 📈 System Status

All integrations are ready:
- ✅ Database: SQLite with seeded data
- ✅ WhatsApp API: Configured and ready
- ✅ Google Sheets: Service account authenticated
- ✅ Frontend: Professional UI with animations
- ✅ Backend: REST API with error handling

## 🔍 Testing

The system includes comprehensive error handling and logging for easy debugging:
- API request/response logging
- WhatsApp delivery status tracking
- Google Sheets sync confirmation
- Form validation with clear error messages

---

**Ready to transform your polymer trading operations!** 🚀