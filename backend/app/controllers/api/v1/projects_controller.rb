class Api::V1::ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :update, :destroy]

  # GET /api/v1/projects
  def index
    @projects = current_user.role == 'admin' ? Project.all : current_user.projects
    render json: @projects.map { |p| project_json(p) }
  end

  # GET /api/v1/projects/:id
  def show
    render json: project_detail_json(@project)
  end

  # POST /api/v1/projects
  def create
    @project = current_user.projects.build(project_params)

    if @project.save
      render json: project_json(@project), status: :created
    else
      render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/projects/:id
  def update
    if @project.update(project_params)
      render json: project_json(@project)
    else
      render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/projects/:id
  def destroy
    @project.destroy
    head :no_content
  end

  private

  def set_project
    @project = Project.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:name, :client_name, :location, :budget, :start_date, :end_date, :status, :description)
  end

  def project_json(project)
    {
      id: project.id,
      name: project.name,
      client_name: project.client_name,
      location: project.location,
      budget: project.budget,
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at
    }
  end

  def project_detail_json(project)
    project_json(project).merge(
      stats: {
        total_workers: project.workers.count,
        active_workers: project.active_workers_count,
        total_labor_cost: project.total_labor_cost,
        total_material_cost: project.total_material_cost,
        total_expenses: project.total_expenses,
        total_cost: project.total_cost,
        total_client_advance: project.total_client_advance,
        profit_loss: project.profit_loss
      }
    )
  end
end
