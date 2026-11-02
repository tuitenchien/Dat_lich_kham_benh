import { useState, useEffect, useContext } from 'react';
import { Badge, Popover, message } from 'antd';
import { Bell, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { apiClient } from '../../config/axiosClient';
import Context from '../../store/Context';
import { useSocket } from '../../context/SocketContext';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const { dataUser } = useContext(Context);
    const { socket } = useSocket() || {};
    const navigate = useNavigate();

    useEffect(() => {
        if (!dataUser) return;
        
        fetchNotifications();
    }, [dataUser]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotif = (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            message.info(newNotif.title);
        };

        socket.on('new_notification', handleNewNotif);

        return () => {
            socket.off('new_notification', handleNewNotif);
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const res = await apiClient.get('/api/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.meta.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleMarkAsRead = async (id, link) => {
        try {
            await apiClient.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            setOpen(false);
            if (link) navigate(link);
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiClient.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const content = (
        <div className="w-80 max-h-[400px] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 shrink-0">
                <span className="font-semibold text-gray-800">Thông báo</span>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                        <Check size={14} /> Đánh dấu đã đọc
                    </button>
                )}
            </div>
            
            <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Không có thông báo nào</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif._id} 
                            onClick={() => handleMarkAsRead(notif._id, notif.link)}
                            className={`p-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Bell size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm mb-0.5 truncate ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {notif.content}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                        <Clock size={10} /> {dayjs(notif.createdAt).fromNow()}
                                    </p>
                                </div>
                                {!notif.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <Popover 
            content={content} 
            trigger="click" 
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}
            styles={{ body: { padding: 0, borderRadius: '12px' } }}
        >
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                    <Bell size={20} />
                </Badge>
            </div>
        </Popover>
    );
}
