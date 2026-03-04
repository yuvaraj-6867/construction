class Api::V1::WorkDiariesController < ApplicationController
  def index
    @diaries = params[:project_id] ? WorkDiary.where(project_id: params[:project_id]) : WorkDiary.all
    render json: @diaries.order(date: :desc)
  end

  def create
    @diary = WorkDiary.new(diary_params.merge(user: current_user))
    if @diary.save
      render json: @diary, status: :created
    else
      render json: { errors: @diary.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @diary = WorkDiary.find(params[:id])
    if @diary.update(diary_params)
      render json: @diary
    else
      render json: { errors: @diary.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    WorkDiary.find(params[:id]).destroy
    head :no_content
  end

  private

  def diary_params
    params.require(:work_diary).permit(:project_id, :date, :title, :description, :weather, :workers_present_count, :work_done, :issues)
  end
end
