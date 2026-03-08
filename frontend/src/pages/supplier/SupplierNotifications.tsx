import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications';
import { toastSuccess, toastError } from '@/hooks/useToast';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SupplierNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.list({ per_page: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toastSuccess('Notification marked as read');
    },
    onError: () => {
      toastError('Failed to mark notification as read');
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = data?.items?.filter(n => !n.is_read).map(n => n.id) || [];
      if (unreadIds.length > 0) {
        await notificationsService.markReadMany(unreadIds);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toastSuccess('All notifications marked as read');
    },
    onError: () => {
      toastError('Failed to mark notifications as read');
    },
  });

  const unreadCount = data?.items?.filter(n => !n.is_read).length || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading notifications...</div>
      ) : !data?.items?.length ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No notifications yet</p>
          <Link to="/supplier/tenders" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Browse tenders to get started
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data.items.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.is_read
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className={`font-medium ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => markReadMutation.mutate(notification.id)}
                    disabled={markReadMutation.isPending}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupplierNotifications;
