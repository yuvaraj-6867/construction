class Api::V1::DashboardController < ApplicationController
  def stats
    today = Date.current

    # Project stats
    total_projects = Project.where(user: current_user).count
    active_projects = Project.where(user: current_user, status: 'in-progress').count

    # Worker stats
    total_workers = Worker.joins(:project).where(projects: { user: current_user }).count
    active_workers = Worker.joins(:project).where(projects: { user: current_user }, is_active: true).count

    # Payment stats (across all user's projects)
    project_ids = Project.where(user: current_user).pluck(:id)

    total_wages_earned = Attendance.where(project_id: project_ids).sum(:wage)
    total_advances = Payment.where(project_id: project_ids, payment_type: 'advance').sum(:amount)
    total_wage_payments = Payment.where(project_id: project_ids, payment_type: 'wage').sum(:amount)
    total_paid = total_advances + total_wage_payments
    total_balance = total_wages_earned - total_paid

    # Today's attendance
    today_attendances = Attendance.where(project_id: project_ids, date: today)
    today_present = today_attendances.where(status: 'present').count
    today_half_day = today_attendances.where(status: 'half-day').count
    today_absent = today_attendances.where(status: 'absent').count

    # Recent payments (last 5)
    recent_payments = Payment.where(project_id: project_ids)
                             .includes(:worker, :project)
                             .order(created_at: :desc)
                             .limit(5)
                             .map do |p|
      {
        id: p.id,
        worker_name: p.worker.name,
        project_name: p.project.name,
        amount: p.amount,
        payment_type: p.payment_type,
        date: p.date
      }
    end

    # Recent projects (last 5)
    recent_projects = Project.where(user: current_user)
                             .order(created_at: :desc)
                             .limit(5)
                             .map do |proj|
      {
        id: proj.id,
        name: proj.name,
        status: proj.status,
        budget: proj.budget,
        client_name: proj.client_name,
        active_workers: proj.active_workers_count
      }
    end

    render json: {
      projects: {
        total: total_projects,
        active: active_projects
      },
      workers: {
        total: total_workers,
        active: active_workers
      },
      payments: {
        total_wages_earned: total_wages_earned,
        total_paid: total_paid,
        total_balance: total_balance
      },
      today_attendance: {
        present: today_present,
        half_day: today_half_day,
        absent: today_absent,
        total: today_present + today_half_day + today_absent
      },
      recent_payments: recent_payments,
      recent_projects: recent_projects
    }
  end
end
