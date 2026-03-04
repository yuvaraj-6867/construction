class Api::V1::MaterialsController < ApplicationController
  def index
    @materials = params[:project_id] ? Material.where(project_id: params[:project_id]) : Material.all
    render json: @materials.order(purchase_date: :desc)
  end

  def create
    @material = Material.new(material_params.merge(user: current_user))
    if @material.save
      @material.project.check_budget_alert!(current_user) rescue nil
      render json: @material, status: :created
    else
      render json: { errors: @material.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @material = Material.find(params[:id])
    @material.destroy
    head :no_content
  end

  private

  def material_params
    params.require(:material).permit(:project_id, :name, :quantity, :unit, :cost, :total_cost, :supplier, :purchase_date, :invoice_number, :notes)
  end
end
