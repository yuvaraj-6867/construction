module Api
  module V1
    class SitePhotosController < ApplicationController
      before_action :authenticate_request

      def index
        photos = SitePhoto.where(project_id: params[:project_id])
                          .order(created_at: :desc)
        render json: photos.map { |p| photo_json(p) }
      end

      def create
        photo = SitePhoto.new(
          project_id: photo_params[:project_id],
          url: photo_params[:url],
          caption: photo_params[:caption],
          user: current_user
        )
        if photo.save
          render json: photo_json(photo), status: :created
        else
          render json: { error: photo.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def destroy
        photo = SitePhoto.find_by(id: params[:id])
        return render json: { error: 'Not found' }, status: :not_found unless photo

        photo.destroy
        render json: { message: 'Deleted' }
      end

      private

      def photo_params
        params.require(:site_photo).permit(:project_id, :url, :caption)
      end

      def photo_json(p)
        {
          id: p.id,
          project_id: p.project_id,
          url: p.url,
          caption: p.caption,
          created_at: p.created_at,
          uploaded_by: p.user&.name
        }
      end
    end
  end
end
