#!/bin/bash

# Construction Management API - Model Generation Script

echo "=== Creating all database models and migrations ==="

# User model
echo "Creating User model..."
rails generate model User email:string:uniq password_digest:string name:string role:string phone:string

# Project model
echo "Creating Project model..."
rails generate model Project name:string client_name:string location:string budget:decimal start_date:date end_date:date status:string description:text user:references

# Worker model
echo "Creating Worker model..."
rails generate model Worker name:string phone:string role:string daily_wage:decimal project:references is_active:boolean joined_date:date

# Attendance model
echo "Creating Attendance model..."
rails generate model Attendance worker:references project:references date:date status:string wage:decimal notes:text user:references

# Payment model
echo "Creating Payment model..."
rails generate model Payment worker:references project:references amount:decimal date:date payment_type:string notes:text user:references

# Material model
echo "Creating Material model..."
rails generate model Material project:references name:string quantity:decimal unit:string cost:decimal total_cost:decimal supplier:string purchase_date:date invoice_number:string notes:text user:references

# Expense model
echo "Creating Expense model..."
rails generate model Expense project:references category:string description:string amount:decimal date:date bill_number:string notes:text user:references

# ClientAdvance model
echo "Creating ClientAdvance model..."
rails generate model ClientAdvance project:references amount:decimal date:date payment_method:string reference_number:string notes:text user:references

# Invoice model
echo "Creating Invoice model..."
rails generate model Invoice project:references invoice_number:string amount:decimal date:date due_date:date status:string items:jsonb notes:text user:references

# SitePhoto model
echo "Creating SitePhoto model..."
rails generate model SitePhoto project:references url:string caption:text user:references

echo "=== All models created successfully! ==="
echo "Run 'rails db:migrate' to apply migrations"
