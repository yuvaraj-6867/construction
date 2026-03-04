class Api::V1::InvoicesController < ApplicationController
  before_action :authenticate_request

  def index
    @invoices = params[:project_id] ? Invoice.where(project_id: params[:project_id]) : Invoice.all
    # Check for overdue on fetch and create notifications
    check_overdue_invoices(@invoices)
    render json: @invoices.order(date: :desc)
  end

  def show
    @invoice = Invoice.find(params[:id])
    render json: @invoice
  end

  def create
    @invoice = Invoice.new(invoice_params.merge(user: current_user))
    if @invoice.save
      render json: @invoice, status: :created
    else
      render json: { errors: @invoice.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @invoice = Invoice.find_by(id: params[:id])
    return render json: { error: 'Not found' }, status: :not_found unless @invoice

    if @invoice.update(invoice_params)
      render json: @invoice
    else
      render json: { errors: @invoice.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @invoice = Invoice.find_by(id: params[:id])
    return render json: { error: 'Not found' }, status: :not_found unless @invoice
    @invoice.destroy
    render json: { message: 'Deleted' }
  end

  private

  def invoice_params
    params.require(:invoice).permit(:project_id, :invoice_number, :amount, :date, :due_date, :status, :items, :notes)
  end

  def check_overdue_invoices(invoices)
    return unless current_user
    today = Date.today
    overdue = invoices.select { |inv| inv.due_date && inv.due_date < today && inv.status != 'paid' }
    overdue.each do |inv|
      notif_key = "overdue_invoice_#{inv.id}"
      next if Notification.exists?(user: current_user, data: { key: notif_key }.to_json)
      Notification.create!(
        user: current_user,
        title: "Invoice Overdue",
        message: "Invoice #{inv.invoice_number} for ₹#{inv.amount} is overdue (due #{inv.due_date.strftime('%d %b %Y')})",
        notification_type: 'warning',
        data: { key: notif_key }.to_json
      )
    end
  rescue => e
    Rails.logger.error "Overdue check failed: #{e.message}"
  end
end
