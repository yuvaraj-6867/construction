class Api::V1::AttendancesController < ApplicationController
  # GET /api/v1/attendances
  def index
    @attendances = Attendance.all
    @attendances = @attendances.where(project_id: params[:project_id]) if params[:project_id]
    @attendances = @attendances.where(worker_id: params[:worker_id]) if params[:worker_id]
    @attendances = @attendances.where(date: params[:date]) if params[:date]
    if params[:start_date].present? && params[:end_date].present?
      @attendances = @attendances.where(date: Date.parse(params[:start_date])..Date.parse(params[:end_date]))
    end

    render json: @attendances.order(date: :desc).map { |a| attendance_json(a) }
  end

  # POST /api/v1/attendances
  def create
    @attendance = Attendance.new(attendance_params.merge(user: current_user))

    if @attendance.save
      render json: attendance_json(@attendance), status: :created
    else
      render json: { errors: @attendance.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/attendances/bulk_create
  def bulk_create
    attendances = []
    errors = []
    date = params[:attendances]&.first&.[](:date)

    params[:attendances].each do |att_params|
      attendance = Attendance.new(att_params.permit(:worker_id, :project_id, :date, :status, :notes).merge(user: current_user))
      if attendance.save
        attendances << attendance
      else
        errors << { worker_id: att_params[:worker_id], errors: attendance.errors.full_messages }
      end
    end

    if errors.empty?
      Notification.create_for_attendance(current_user, attendances.count, date) rescue nil
      render json: { message: 'Attendance marked successfully', count: attendances.count }, status: :created
    else
      render json: { created: attendances.count, errors: errors }, status: :partial_content
    end
  end

  # PATCH/PUT /api/v1/attendances/:id
  def update
    @attendance = Attendance.find(params[:id])

    if @attendance.update(attendance_params)
      render json: attendance_json(@attendance)
    else
      render json: { errors: @attendance.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/attendances/:id
  def destroy
    @attendance = Attendance.find(params[:id])
    @attendance.destroy
    head :no_content
  end

  private

  def attendance_params
    params.require(:attendance).permit(:worker_id, :project_id, :date, :status, :notes)
  end

  def attendance_json(attendance)
    {
      id: attendance.id,
      worker_id: attendance.worker_id,
      worker_name: attendance.worker.name,
      project_id: attendance.project_id,
      date: attendance.date,
      status: attendance.status,
      wage: attendance.wage,
      notes: attendance.notes
    }
  end
end
