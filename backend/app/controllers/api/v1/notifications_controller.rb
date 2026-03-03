class Api::V1::NotificationsController < ApplicationController
  # GET /api/v1/notifications
  def index
    @notifications = current_user.notifications.recent
    render json: @notifications.map { |n| notification_json(n) }
  end

  # GET /api/v1/notifications/unread_count
  def unread_count
    count = current_user.notifications.unread.count
    render json: { count: count }
  end

  # PATCH /api/v1/notifications/:id/mark_read
  def mark_read
    notification = current_user.notifications.find(params[:id])
    notification.update!(read: true)
    render json: notification_json(notification)
  end

  # PATCH /api/v1/notifications/mark_all_read
  def mark_all_read
    current_user.notifications.unread.update_all(read: true)
    render json: { message: 'All notifications marked as read' }
  end

  private

  def notification_json(n)
    {
      id: n.id,
      title: n.title,
      message: n.message,
      notification_type: n.notification_type,
      read: n.read,
      data: n.data,
      created_at: n.created_at
    }
  end
end
