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
      worker = @payment.worker
      Notification.create_for_payment(current_user, @payment, worker) rescue nil
      PaymentMailer.payment_confirmation(current_user, @payment, worker).deliver_later rescue nil
      render json: @payment, status: :created
    else
      render json: { errors: @payment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @payment = Payment.find(params[:id])
    if @payment.update(payment_params)
      render json: @payment
    else
      render json: { errors: @payment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @payment = Payment.find(params[:id])
    @payment.destroy
    head :no_content
  end

  # POST /api/v1/payments/bulk_create
  def bulk_create
    payments = []
    errors = []

    params[:payments].each do |p|
      payment = Payment.new(
        p.permit(:worker_id, :project_id, :amount, :date, :payment_type, :notes)
          .merge(user: current_user)
      )
      if payment.save
        payments << payment
        Notification.create_for_payment(current_user, payment, payment.worker) rescue nil
      else
        errors << { worker_id: p[:worker_id], errors: payment.errors.full_messages }
      end
    end

    if errors.empty?
      render json: { message: "#{payments.count} payments recorded", count: payments.count }, status: :created
    else
      render json: { created: payments.count, errors: errors }, status: :partial_content
    end
  end

  private

  def payment_params
    params.require(:payment).permit(:worker_id, :project_id, :amount, :date, :payment_type, :notes)
  end
end
