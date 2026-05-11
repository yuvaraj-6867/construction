class Api::V1::ExpensesController < ApplicationController
  def index
    @expenses = Expense.includes(:project)
    @expenses = @expenses.where(project_id: params[:project_id]) if params[:project_id]
    render json: @expenses.order(date: :desc).map { |e| expense_json(e) }
  end

  def create
    @expense = Expense.new(expense_params.merge(user: current_user))
    if @expense.save
      @expense.project.check_budget_alert!(current_user) rescue nil
      render json: expense_json(@expense), status: :created
    else
      render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @expense = Expense.find(params[:id])
    if @expense.update(expense_params)
      render json: expense_json(@expense)
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

  def expense_json(expense)
    {
      id: expense.id,
      project_id: expense.project_id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.date,
      payment_method: expense.payment_method,
      bill_number: expense.bill_number,
      notes: expense.notes,
      project: expense.project ? { id: expense.project.id, name: expense.project.name } : nil
    }
  end

  def expense_params
    permitted = params.require(:expense).permit(:project_id, :category, :description, :amount, :expense_date, :date, :payment_method, :bill_number, :notes)
    permitted[:date] = permitted.delete(:expense_date) if permitted.key?(:expense_date)
    permitted
  end
end
