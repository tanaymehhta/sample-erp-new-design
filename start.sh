#!/bin/bash

echo "🚀 Starting Polymer Trading Management System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️ Setting up database..."
    npx prisma db push
    npm run seed
fi

echo "🎯 Starting development servers..."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
npx concurrently \
  --names "FRONTEND,BACKEND" \
  --prefix-colors "cyan.bold,yellow.bold" \
  "npm run dev" \
  "npm run server"