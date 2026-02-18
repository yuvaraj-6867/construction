class Api::V1::InvoicesController < ApplicationController
  def index
    @invoices = params[:project_id] ? Invoice.where(project_id: params[:project_id]) : Invoice.all
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

  private

  def invoice_params
    params.require(:invoice).permit(:project_id, :invoice_number, :amount, :date, :due_date, :status, :items, :notes)
  end
end
