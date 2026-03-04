module Api
  module V1
    class ProjectMilestonesController < ApplicationController
      before_action :authenticate_request

      def index
        milestones = ProjectMilestone.where(project_id: params[:project_id])
                                     .order(target_date: :asc)
        render json: milestones.map { |m| milestone_json(m) }
      end

      def create
        milestone = ProjectMilestone.new(milestone_params.merge(user: current_user))
        if milestone.save
          render json: milestone_json(milestone), status: :created
        else
          render json: { error: milestone.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def update
        milestone = ProjectMilestone.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless milestone

        if milestone.update(milestone_params)
          render json: milestone_json(milestone)
        else
          render json: { error: milestone.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def destroy
        milestone = ProjectMilestone.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless milestone
        milestone.destroy
        render json: { message: 'Deleted' }
      end

      private

      def milestone_params
        params.require(:project_milestone).permit(:project_id, :title, :target_date, :completed, :completion_pct, :notes)
      end

      def milestone_json(m)
        {
          id: m.id,
          project_id: m.project_id,
          title: m.title,
          target_date: m.target_date,
          completed: m.completed,
          completion_pct: m.completion_pct || 0,
          notes: m.notes,
          created_at: m.created_at
        }
      end
    end
  end
end
