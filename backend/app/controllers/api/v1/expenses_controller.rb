class Api::V1::ExpensesController < ApplicationController
  def index
    @expenses = params[:project_id] ? Expense.where(project_id: params[:project_id]) : Expense.all
    render json: @expenses.order(date: :desc)
  end

  def create
    @expense = Expense.new(expense_params.merge(user: current_user))
    if @expense.save
      @expense.project.check_budget_alert!(current_user) rescue nil
      render json: @expense, status: :created
    else
      render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @expense = Expense.find(params[:id])
    @expense.destroy
    head :no_content
  end

  private

  def expense_params
    params.require(:expense).permit(:project_id, :category, :description, :amount, :date, :bill_number, :notes)
  end
end
