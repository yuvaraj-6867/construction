#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "  Construction API - Database Setup"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL status..."
if sudo service postgresql status | grep -q "online"; then
    echo "   ✅ PostgreSQL is running"
else
    echo "   ⚠️  PostgreSQL is not running. Starting..."
    sudo service postgresql start
fi
echo ""

# Create databases
echo "2. Creating databases..."
rails db:create
echo ""

# Run migrations
echo "3. Running migrations..."
rails db:migrate
echo ""

# Show migration status
echo "4. Migration status:"
rails db:migrate:status
echo ""

echo "═══════════════════════════════════════════════════════"
echo "  ✅ Database setup complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Start the server with:"
echo "  rails server -p 3001"
echo ""
echo "API will be available at: http://localhost:3001"
echo ""
