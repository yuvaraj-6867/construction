class Api::V1::PaymentsController < ApplicationController
  def index
    @payments = Payment.includes(:worker, :project).all
    @payments = @payments.where(project_id: params[:project_id]) if params[:project_id]
    @payments = @payments.where(worker_id: params[:worker_id]) if params[:worker_id]
    render json: @payments.order(created_at: :desc).map { |p| payment_json(p) }
  end

  def create
    @payment = Payment.new(payment_params.merge(user: current_user))
    if @payment.save
      worker = @payment.worker
      if @payment.payment_type == "wage" || @payment.payment_type.nil?
        worker.update_column(:last_settled_date, @payment.date || Date.today)
      end
      Notification.create_for_payment(current_user, @payment, worker) rescue nil
      PaymentMailer.payment_confirmation(current_user, @payment, worker).deliver_later rescue nil
      render json: payment_json(@payment), status: :created
    else
      render json: { errors: @payment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @payment = Payment.find(params[:id])
    if @payment.update(payment_params)
      render json: payment_json(@payment)
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
        if payment.payment_type == "wage" || payment.payment_type.nil?
          payment.worker.update_column(:last_settled_date, payment.date || Date.today)
        end
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

  def payment_json(payment)
    {
      id: payment.id,
      worker_id: payment.worker_id,
      project_id: payment.project_id,
      amount: payment.amount,
      payment_date: payment.payment_date || payment.date || payment.created_at&.to_date,
      payment_method: payment.payment_method || "cash",
      payment_type: payment.payment_type,
      notes: payment.notes,
      created_at: payment.created_at,
      worker: payment.worker ? { id: payment.worker.id, name: payment.worker.name, role: payment.worker.role } : nil,
      project: payment.project ? { id: payment.project.id, name: payment.project.name } : nil
    }
  end

  def payment_params
    permitted = params.require(:payment).permit(
      :worker_id, :project_id, :amount, :payment_date, :date,
      :payment_method, :payment_type, :notes
    )
    # Map payment_date → date (legacy column)
    if permitted[:payment_date].present?
      permitted[:date] = permitted.delete(:payment_date) unless Payment.column_names.include?("payment_date")
    end
    permitted
  end
end
