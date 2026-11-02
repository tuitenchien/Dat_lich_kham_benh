import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import Context from '../store/Context';
import { apiClient } from '../config/axiosClient';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { dataUser } = useContext(Context);
    const socketRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    // Kết nối socket khi đã đăng nhập
    useEffect(() => {
        const isLoggedIn = !!Cookies.get('logged');
        if (!isLoggedIn || !dataUser?._id) return;

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            withCredentials: true,
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join');
        });

        return () => {
            socket.disconnect();
        };
    }, [dataUser?._id]);

    // Lấy số tin chưa đọc khi đăng nhập
    useEffect(() => {
        const isLoggedIn = !!Cookies.get('logged');
        if (!isLoggedIn || !dataUser?._id) return;

        const fetchUnread = async () => {
            try {
                const res = await apiClient.get('/api/conversations/unread-count');
                setUnreadCount(res.data.metadata?.count || 0);
                setPendingCount(res.data.metadata?.pendingCount || 0);
            } catch {}
        };
        fetchUnread();

        if (socketRef.current) {
            socketRef.current.on('receive_message', fetchUnread);
            socketRef.current.on('new_conversation', fetchUnread);
            return () => {
                socketRef.current.off('receive_message', fetchUnread);
                socketRef.current.off('new_conversation', fetchUnread);
            };
        }
    }, [dataUser?._id, socketRef.current]);

    const refreshUnread = async () => {
        try {
            const res = await apiClient.get('/api/conversations/unread-count');
            setUnreadCount(res.data.metadata?.count || 0);
            setPendingCount(res.data.metadata?.pendingCount || 0);
        } catch {}
    };

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, unreadCount, pendingCount, refreshUnread, setUnreadCount, setPendingCount }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}

export default SocketContext;
