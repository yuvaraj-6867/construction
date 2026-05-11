class Api::V1::MaterialsController < ApplicationController
  def index
    @materials = Material.includes(:project)
    @materials = @materials.where(project_id: params[:project_id]) if params[:project_id]
    render json: @materials.order(purchase_date: :desc).map { |m| material_json(m) }
  end

  def create
    @material = Material.new(material_params.merge(user: current_user))
    if @material.save
      @material.project.check_budget_alert!(current_user) rescue nil
      render json: material_json(@material), status: :created
    else
      render json: { errors: @material.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @material = Material.find(params[:id])
    if @material.update(material_params)
      render json: material_json(@material)
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

  def material_json(material)
    {
      id: material.id,
      project_id: material.project_id,
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      unit_price: material.cost || (material.quantity.to_f > 0 ? (material.total_cost.to_f / material.quantity.to_f).round(2) : 0),
      total_cost: material.total_cost,
      supplier_name: material.supplier,
      purchase_date: material.purchase_date,
      notes: material.notes,
      project: material.project ? { id: material.project.id, name: material.project.name } : nil
    }
  end

  def material_params
    permitted = params.require(:material).permit(
      :project_id, :name, :quantity, :unit,
      :unit_price, :cost, :total_cost,
      :supplier_name, :supplier,
      :purchase_date, :notes
    )
    permitted[:cost] = permitted.delete(:unit_price) if permitted.key?(:unit_price)
    permitted[:supplier] = permitted.delete(:supplier_name) if permitted.key?(:supplier_name)
    permitted
  end
end
