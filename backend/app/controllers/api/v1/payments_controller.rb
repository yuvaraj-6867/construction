class Api::V1::PaymentsController < ApplicationController
  def index
    @payments = Payment.all
    @payments = @payments.where(project_id: params[:project_id]) if params[:project_id]
    @payments = @payments.where(worker_id: params[:worker_id]) if params[:worker_id]
    render json: @payments.order(date: :desc)
  end

  def create
    @payment = Payment.new(payment_params.merge(user: current_user))
    if @payment.save
      render json: @payment, status: :created
    else
      render json: { errors: @payment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def payment_params
    params.require(:payment).permit(:worker_id, :project_id, :amount, :date, :payment_type, :notes)
  end
end
