module Api
  module V1
    class WorkerLoansController < ApplicationController
      before_action :authenticate_request

      def index
        loans = if params[:worker_id]
          WorkerLoan.where(worker_id: params[:worker_id])
        elsif params[:project_id]
          WorkerLoan.where(project_id: params[:project_id])
        else
          WorkerLoan.all
        end
        render json: loans.order(loan_date: :desc).map { |l| loan_json(l) }
      end

      def create
        loan = WorkerLoan.new(loan_params.merge(user: current_user))
        if loan.save
          render json: loan_json(loan), status: :created
        else
          render json: { error: loan.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def update
        loan = WorkerLoan.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless loan

        if loan.update(loan_params)
          render json: loan_json(loan)
        else
          render json: { error: loan.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def destroy
        loan = WorkerLoan.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless loan
        loan.destroy
        render json: { message: 'Deleted' }
      end

      private

      def loan_params
        params.require(:worker_loan).permit(:worker_id, :project_id, :loan_amount, :repaid_amount, :loan_date, :purpose, :notes)
      end

      def loan_json(l)
        {
          id: l.id,
          worker_id: l.worker_id,
          worker_name: l.worker&.name,
          project_id: l.project_id,
          project_name: l.project&.name,
          loan_amount: l.loan_amount,
          repaid_amount: l.repaid_amount || 0,
          balance: l.balance,
          loan_date: l.loan_date,
          purpose: l.purpose,
          notes: l.notes,
          created_at: l.created_at
        }
      end
    end
  end
end
