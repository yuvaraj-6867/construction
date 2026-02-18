#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Creating PostgreSQL User for Rails Application       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Create PostgreSQL user with superuser privileges
echo "Creating PostgreSQL user 'yuvaraj'..."
echo "You will be prompted for your system password to run sudo commands."
echo ""

sudo -u postgres createuser -s yuvaraj 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL user 'yuvaraj' created successfully!"
else
    echo "⚠️  User might already exist. Checking..."
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='yuvaraj'" | grep -q 1; then
        echo "✅ User 'yuvaraj' already exists!"
    else
        echo "❌ Failed to create user. Please run manually:"
        echo "   sudo -u postgres createuser -s yuvaraj"
        exit 1
    fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Next Steps                                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Now run these commands:"
echo "  rails db:create"
echo "  rails db:migrate"
echo "  rails server -p 3001"
echo ""
