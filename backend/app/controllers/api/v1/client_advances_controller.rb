class Api::V1::ClientAdvancesController < ApplicationController
  def index
    @advances = params[:project_id] ? ClientAdvance.where(project_id: params[:project_id]) : ClientAdvance.all
    render json: @advances.order(date: :desc)
  end

  def create
    @advance = ClientAdvance.new(advance_params.merge(user: current_user))
    if @advance.save
      render json: @advance, status: :created
    else
      render json: { errors: @advance.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def advance_params
    params.require(:client_advance).permit(:project_id, :amount, :date, :payment_method, :reference_number, :notes)
  end
end
