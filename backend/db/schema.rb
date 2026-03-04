# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_04_000003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "attendances", force: :cascade do |t|
    t.bigint "worker_id", null: false
    t.bigint "project_id", null: false
    t.date "date"
    t.string "status"
    t.decimal "wage"
    t.text "notes"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_attendances_on_project_id"
    t.index ["user_id"], name: "index_attendances_on_user_id"
    t.index ["worker_id"], name: "index_attendances_on_worker_id"
  end

  create_table "client_advances", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.decimal "amount"
    t.date "date"
    t.string "payment_method"
    t.string "reference_number"
    t.text "notes"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_client_advances_on_project_id"
    t.index ["user_id"], name: "index_client_advances_on_user_id"
  end

  create_table "expenses", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.string "category"
    t.string "description"
    t.decimal "amount"
    t.date "date"
    t.string "bill_number"
    t.text "notes"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_expenses_on_project_id"
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "invoices", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.string "invoice_number"
    t.decimal "amount"
    t.date "date"
    t.date "due_date"
    t.string "status"
    t.jsonb "items"
    t.text "notes"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_invoices_on_project_id"
    t.index ["user_id"], name: "index_invoices_on_user_id"
  end

  create_table "materials", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.string "name"
    t.decimal "quantity"
    t.string "unit"
    t.decimal "cost"
    t.decimal "total_cost"
    t.string "supplier"
    t.date "purchase_date"
    t.string "invoice_number"
    t.text "notes"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_materials_on_project_id"
    t.index ["user_id"], name: "index_materials_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.string "message", null: false
    t.string "notification_type", default: "info"
    t.boolean "read", default: false
    t.jsonb "data", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "read"], name: "index_notifications_on_user_id_and_read"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "worker_id", null: false
    t.bigint "project_id", null: false
    t.decimal "amount"
    t.date "date"
    t.string "payment_type"
    t.text "notes"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_payments_on_project_id"
    t.index ["user_id"], name: "index_payments_on_user_id"
    t.index ["worker_id"], name: "index_payments_on_worker_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name"
    t.string "client_name"
    t.string "location"
    t.decimal "budget"
    t.date "start_date"
    t.date "end_date"
    t.string "status"
    t.text "description"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "site_photos", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.string "url"
    t.text "caption"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_site_photos_on_project_id"
    t.index ["user_id"], name: "index_site_photos_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest", comment: "Password must be at least 8 characters with 1 uppercase, 1 number, 1 special character (@$!%*?&#)"
    t.string "name"
    t.string "role"
    t.string "phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "workers", force: :cascade do |t|
    t.string "name"
    t.string "phone"
    t.string "role"
    t.decimal "daily_wage"
    t.bigint "project_id", null: false
    t.boolean "is_active"
    t.date "joined_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "payment_type", default: "daily"
    t.decimal "contract_amount", precision: 10, scale: 2
    t.index ["project_id"], name: "index_workers_on_project_id"
  end

  add_foreign_key "attendances", "projects"
  add_foreign_key "attendances", "users"
  add_foreign_key "attendances", "workers"
  add_foreign_key "client_advances", "projects"
  add_foreign_key "client_advances", "users"
  add_foreign_key "expenses", "projects"
  add_foreign_key "expenses", "users"
  add_foreign_key "invoices", "projects"
  add_foreign_key "invoices", "users"
  add_foreign_key "materials", "projects"
  add_foreign_key "materials", "users"
  add_foreign_key "notifications", "users"
  add_foreign_key "payments", "projects"
  add_foreign_key "payments", "users"
  add_foreign_key "payments", "workers"
  add_foreign_key "projects", "users"
  add_foreign_key "site_photos", "projects"
  add_foreign_key "site_photos", "users"
  add_foreign_key "workers", "projects"
end
