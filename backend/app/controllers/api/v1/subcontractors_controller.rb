module Api
  module V1
    class SubcontractorsController < ApplicationController
      before_action :authenticate_request

      def index
        subs = Subcontractor.where(project_id: params[:project_id])
                            .order(created_at: :desc)
        render json: subs.map { |s| sub_json(s) }
      end

      def create
        sub = Subcontractor.new(sub_params.merge(user: current_user))
        if sub.save
          render json: sub_json(sub), status: :created
        else
          render json: { error: sub.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def update
        sub = Subcontractor.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless sub

        if sub.update(sub_params)
          render json: sub_json(sub)
        else
          render json: { error: sub.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def destroy
        sub = Subcontractor.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless sub
        sub.destroy
        render json: { message: 'Deleted' }
      end

      private

      def sub_params
        params.require(:subcontractor).permit(:project_id, :name, :specialty, :contract_amount, :paid_amount, :phone, :notes)
      end

      def sub_json(s)
        {
          id: s.id,
          project_id: s.project_id,
          name: s.name,
          specialty: s.specialty,
          contract_amount: s.contract_amount || 0,
          paid_amount: s.paid_amount || 0,
          balance_due: s.balance_due,
          phone: s.phone,
          notes: s.notes,
          created_at: s.created_at
        }
      end
    end
  end
end
