# Clear existing data
puts "Clearing existing data..."
SitePhoto.delete_all
Invoice.delete_all
ClientAdvance.delete_all
Expense.delete_all
Material.delete_all
Payment.delete_all
Attendance.delete_all
Worker.delete_all
Project.delete_all
User.delete_all

puts "Creating users..."

# Create demo users
admin = User.create!(
  email: 'admin@construction.com',
  password: 'Admin@123',
  password_confirmation: 'Admin@123',
  name: 'Admin User',
  role: 'admin',
  phone: '9876543210'
)

supervisor = User.create!(
  email: 'supervisor@construction.com',
  password: 'Super@123',
  password_confirmation: 'Super@123',
  name: 'Supervisor Kumar',
  role: 'supervisor',
  phone: '9876543211'
)

manager = User.create!(
  email: 'manager@construction.com',
  password: 'Manager@123',
  password_confirmation: 'Manager@123',
  name: 'Manager Suresh',
  role: 'manager',
  phone: '9876543212'
)

accountant = User.create!(
  email: 'accountant@construction.com',
  password: 'Account@123',
  password_confirmation: 'Account@123',
  name: 'Accountant Ravi',
  role: 'accountant',
  phone: '9876543213'
)

viewer = User.create!(
  email: 'viewer@construction.com',
  password: 'Viewer@123',
  password_confirmation: 'Viewer@123',
  name: 'Viewer Prakash',
  role: 'viewer',
  phone: '9876543214'
)

puts "Created #{User.count} users"

puts "  Admin: admin@construction.com / Admin@123"
puts "  Manager: manager@construction.com / Manager@123"
puts "  Supervisor: supervisor@construction.com / Super@123"
puts "  Accountant: accountant@construction.com / Account@123"
puts "  Viewer: viewer@construction.com / Viewer@123"
