import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { message, Spin, Image } from 'antd';
import {
    MessageSquare, Send, Clock, CheckCircle, User,
    Stethoscope, ChevronLeft, Loader2, Phone, Video, Paperclip, X
} from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import Context from '../../store/Context';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';

const STATUS_MAP = {
    pending:  { label: 'Đang chờ bác sĩ chấp nhận...', color: 'text-amber-500', icon: Clock },
    accepted: { label: 'Đã kết nối', color: 'text-emerald-500', icon: CheckCircle },
};

function ConversationItem({ conv, active, onClick }) {
    const doctor = conv.doctorId;
    const cfg = STATUS_MAP[conv.status] || STATUS_MAP.pending;
    const StatusIcon = cfg.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 hover:bg-gray-50 ${active ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''}`}
        >
            <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                {doctor?.image ? <img src={doctor.image} className="w-full h-full object-cover" alt="" /> : <Stethoscope size={20} className="text-gray-400 m-auto mt-2.5" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{doctor?.name}</p>
                <p className={`text-xs flex items-center gap-1 ${cfg.color}`}><StatusIcon size={11} />{cfg.label}</p>
                {conv.lastMessage && <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>}
            </div>
            {conv.unreadPatient > 0 && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {conv.unreadPatient}
                </span>
            )}
        </button>
    );
}

function ChatWindow({ conv, currentUserId, socket, onMessageSent }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [sending, setSending] = useState(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const { refreshUnread } = useSocket();
    const { callUser } = useWebRTC();

    useEffect(() => {
        if (!conv) return;
        setLoading(true);
        apiClient.get(`/api/conversations/${conv._id}/messages`)
            .then(res => {
                setMessages(res.data.metadata?.messages || []);
                refreshUnread();
            })
            .catch(() => message.error('Lỗi tải tin nhắn'))
            .finally(() => setLoading(false));
    }, [conv?._id]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // Nhận tin nhắn realtime
    useEffect(() => {
        if (!socket || !conv) return;
        const handler = (msg) => {
            if (msg.conversationId === conv._id) {
                setMessages(prev => [...prev, msg]);
                refreshUnread();
            }
        };
        socket.on('receive_message', handler);

        // Lắng nghe accepted event
        const acceptHandler = ({ conversationId }) => {
            if (conversationId === conv._id) {
                message.success('🎉 Bác sĩ đã chấp nhận cuộc trò chuyện!');
                onMessageSent(); // Refresh conv list
            }
        };
        socket.on('conversation_accepted', acceptHandler);

        return () => {
            socket.off('receive_message', handler);
            socket.off('conversation_accepted', acceptHandler);
        };
    }, [socket, conv?._id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn file hình ảnh!');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error('Kích thước ảnh tối đa là 5MB!');
            return;
        }
        setImage(file);
    };

    const handleSend = async () => {
        if (!text.trim() && !image) return;
        if (conv.status !== 'accepted') { message.warning('Bác sĩ chưa chấp nhận cuộc trò chuyện'); return; }
        setSending(true);
        try {
            const formData = new FormData();
            if (text.trim()) formData.append('content', text.trim());
            if (image) formData.append('image', image);

            await apiClient.post(`/api/conversations/${conv._id}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setText('');
            setImage(null);
        } catch (err) {
            message.error(err.response?.data?.message || 'Lỗi gửi tin nhắn');
        } finally {
            setSending(false);
        }
    };

    const doctor = conv.doctorId;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {doctor?.image ? <img src={doctor.image} className="w-full h-full object-cover" alt="" /> : <User size={16} className="text-gray-400 m-auto mt-2.5" />}
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-sm">{doctor?.name}</p>
                    <p className="text-xs text-gray-400">{doctor?.specialtyId?.name}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    {conv.status === 'accepted' ? (
                        <>
                            <button 
                                onClick={() => callUser(doctor?.userId, 'audio', doctor?.name)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition"
                            >
                                <Phone size={15} />
                            </button>
                            <button 
                                onClick={() => callUser(doctor?.userId, 'video', doctor?.name)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition"
                            >
                                <Video size={16} />
                            </button>
                        </>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-medium"><Clock size={13} />Chờ chấp nhận</span>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {loading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center pt-10">
                        <MessageSquare size={40} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                            {conv.status === 'pending' ? 'Tin nhắn của bạn đã được gửi. Đang chờ bác sĩ chấp nhận...' : 'Bắt đầu cuộc trò chuyện!'}
                        </p>
                    </div>
                ) : messages.map(msg => {
                    const isMe = msg.senderId === currentUserId || msg.senderRole === 'patient';
                    return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                            }`}>
                                {msg.image && (
                                    <div className="mb-2">
                                        <Image src={msg.image} className="rounded-lg max-h-60 object-contain" />
                                    </div>
                                )}
                                {msg.content && <p>{msg.content}</p>}
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
                {conv.status !== 'accepted' ? (
                    <p className="text-center text-amber-500 text-sm py-1 flex items-center justify-center gap-1.5">
                        <Clock size={15} /> Đang chờ bác sĩ phản hồi...
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {image && (
                            <div className="relative inline-block w-fit">
                                <img src={URL.createObjectURL(image)} alt="preview" className="h-20 w-auto rounded-lg border border-gray-200 object-cover" />
                                <button 
                                    onClick={() => setImage(null)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition flex-shrink-0"
                            >
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="text"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={(!text.trim() && !image) || sending}
                                className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition flex-shrink-0"
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProfileMessages() {
    const { dataUser } = useContext(Context);
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeConv, setActiveConv] = useState(null);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await apiClient.get('/api/conversations/my');
            const list = res.data.metadata || [];
            setConversations(list);
            if (!activeConv && list.length > 0) setActiveConv(list[0]);
        } catch {}
    }, []);

    useEffect(() => { fetchConversations().finally(() => setLoading(false)); }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '75vh' }}>
            <div className="flex h-full">
                {/* Sidebar */}
                <div className={`w-full sm:w-72 border-r border-gray-100 flex flex-col flex-shrink-0 ${mobileShowChat ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="px-4 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare size={18} className="text-primary-500" /> Tin nhắn
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center pt-12 px-4">
                                <MessageSquare size={36} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Chưa có cuộc trò chuyện nào</p>
                            </div>
                        ) : conversations.map(conv => (
                            <ConversationItem
                                key={conv._id}
                                conv={conv}
                                active={activeConv?._id === conv._id}
                                onClick={() => { setActiveConv(conv); setMobileShowChat(true); }}
                            />
                        ))}
                    </div>
                </div>

                {/* Chat area */}
                <div className={`flex-1 flex flex-col min-w-0 ${mobileShowChat ? 'flex' : 'hidden sm:flex'}`}>
                    {activeConv ? (
                        <>
                            <button className="sm:hidden flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border-b border-gray-100" onClick={() => setMobileShowChat(false)}>
                                <ChevronLeft size={16} /> Quay lại
                            </button>
                            <ChatWindow
                                conv={activeConv}
                                currentUserId={dataUser?._id}
                                socket={socket}
                                onMessageSent={fetchConversations}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <MessageSquare size={56} className="text-gray-200 mb-4" />
                            <h3 className="font-bold text-gray-700 mb-1">Chọn cuộc trò chuyện</h3>
                            <p className="text-gray-400 text-sm">Hoặc nhắn tin với bác sĩ từ trang chi tiết bác sĩ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
