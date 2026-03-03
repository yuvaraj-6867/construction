class Api::V1::ReportsController < ApplicationController
  # GET /api/v1/reports/worker_summary?project_id=&start_date=&end_date=
  def worker_summary
    project_ids = if params[:project_id].present?
                    [params[:project_id]]
                  else
                    Project.where(user: current_user).pluck(:id)
                  end

    workers = Worker.where(project_id: project_ids)
    workers = filter_by_date_range(workers)

    data = workers.map do |w|
      attendances = w.attendances
      attendances = attendances.where(date: date_range) if date_range
      {
        id: w.id,
        name: w.name,
        role: w.role,
        phone: w.phone,
        payment_type: w.payment_type || 'daily',
        daily_wage: w.daily_wage,
        contract_amount: w.contract_amount,
        project_name: w.project.name,
        total_days_present: attendances.where(status: 'present').count,
        total_half_days: attendances.where(status: 'half-day').count,
        total_days_absent: attendances.where(status: 'absent').count,
        total_wages_earned: w.total_wages_earned,
        total_advances: w.total_advances,
        total_payments: w.total_payments,
        balance_due: w.balance_due,
        status: w.is_active ? 'Active' : 'Inactive'
      }
    end

    render json: { workers: data, generated_at: Time.current, date_range: date_range_params }
  end

  # GET /api/v1/reports/project_summary?project_id=
  def project_summary
    project_ids = if params[:project_id].present?
                    [params[:project_id]]
                  else
                    Project.where(user: current_user).pluck(:id)
                  end

    data = Project.where(id: project_ids).map do |proj|
      total_workers = proj.workers.count
      active_workers = proj.workers.where(is_active: true).count
      total_labor = proj.attendances.sum(:wage)
      total_material = proj.materials.sum(:total_cost)
      total_expense = proj.expenses.sum(:amount)
      total_cost = total_labor + total_material + total_expense
      total_received = proj.client_advances.sum(:amount)
      balance_due = proj.workers.sum { |w| w.balance_due }

      {
        id: proj.id,
        name: proj.name,
        client_name: proj.client_name,
        location: proj.location,
        status: proj.status,
        budget: proj.budget,
        start_date: proj.start_date,
        end_date: proj.end_date,
        total_workers: total_workers,
        active_workers: active_workers,
        total_labor_cost: total_labor,
        total_material_cost: total_material,
        total_expenses: total_expense,
        total_cost: total_cost,
        total_received: total_received,
        worker_balance_due: balance_due,
        profit_loss: total_received - total_cost,
        budget_utilization: proj.budget > 0 ? ((total_cost / proj.budget) * 100).round(1) : 0
      }
    end

    render json: { projects: data, generated_at: Time.current }
  end

  private

  def date_range_params
    { start_date: params[:start_date], end_date: params[:end_date] }
  end

  def date_range
    return nil unless params[:start_date].present? && params[:end_date].present?
    Date.parse(params[:start_date])..Date.parse(params[:end_date])
  rescue ArgumentError
    nil
  end

  def filter_by_date_range(workers)
    workers
  end
end
