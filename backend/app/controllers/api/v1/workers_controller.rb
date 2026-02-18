class Api::V1::WorkersController < ApplicationController
  before_action :set_worker, only: [:show, :update, :destroy]

  # GET /api/v1/workers
  def index
    @workers = params[:project_id] ? Worker.where(project_id: params[:project_id]) : Worker.all
    render json: @workers.map { |w| worker_json(w) }
  end

  # GET /api/v1/workers/:id
  def show
    render json: worker_detail_json(@worker)
  end

  # POST /api/v1/workers
  def create
    @worker = Worker.new(worker_params)

    if @worker.save
      render json: worker_json(@worker), status: :created
    else
      render json: { errors: @worker.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/workers/:id
  def update
    if @worker.update(worker_params)
      render json: worker_json(@worker)
    else
      render json: { errors: @worker.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/workers/:id
  def destroy
    @worker.destroy
    head :no_content
  end

  private

  def set_worker
    @worker = Worker.find(params[:id])
  end

  def worker_params
    permitted = params.require(:worker).permit(:name, :phone, :role, :daily_wage, :project_id, :is_active, :joined_date, :status, :address, :advance_given)
    
    # Convert status string to is_active boolean
    if permitted[:status]
      permitted[:is_active] = permitted[:status] == 'active'
      permitted.delete(:status)
    end
    
    permitted
  end

  def worker_json(worker)
    {
      id: worker.id,
      name: worker.name,
      phone: worker.phone,
      role: worker.role,
      daily_wage: worker.daily_wage,
      project_id: worker.project_id,
      is_active: worker.is_active,
      status: worker.is_active ? 'active' : 'inactive',
      joined_date: worker.joined_date
    }
  end

  def worker_detail_json(worker)
    worker_json(worker).merge(
      balance_info: {
        total_wages_earned: worker.total_wages_earned,
        total_advances: worker.total_advances,
        total_payments: worker.total_payments,
        balance_due: worker.balance_due
      },
      recent_attendances: worker.attendances.order(date: :desc).limit(10).map { |a|
        {
          id: a.id,
          date: a.date,
          status: a.status,
          wage: a.wage
        }
      }
    )
  end
end
