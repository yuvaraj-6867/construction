class Api::V1::EquipmentsController < ApplicationController
  def index
    @equipments = params[:project_id] ? Equipment.where(project_id: params[:project_id]) : Equipment.all
    render json: @equipments.order(usage_date: :desc)
  end

  def create
    @equipment = Equipment.new(equipment_params.merge(user: current_user))
    if @equipment.save
      render json: @equipment, status: :created
    else
      render json: { errors: @equipment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @equipment = Equipment.find(params[:id])
    if @equipment.update(equipment_params)
      render json: @equipment
    else
      render json: { errors: @equipment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    Equipment.find(params[:id]).destroy
    head :no_content
  end

  private

  def equipment_params
    params.require(:equipment).permit(:project_id, :name, :equipment_type, :usage_date, :hours_used, :daily_rate, :total_cost, :operator_name, :notes)
  end
end
