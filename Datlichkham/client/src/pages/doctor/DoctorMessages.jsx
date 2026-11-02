import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { message as antMsg, Tabs, Image } from 'antd';
import { MessageSquare, Send, CheckCircle, User, Clock, ChevronLeft, Loader2, Bell, Phone, Video, Paperclip, X } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';
import Context from '../../store/Context';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';

const STATUS_MAP = {
    pending:  { label: 'Yêu cầu mới', color: 'text-amber-500' },
    accepted: { label: 'Đang trò chuyện', color: 'text-emerald-500' },
};

function ConversationItem({ conv, active, onClick }) {
    const patient = conv.patientId;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 hover:bg-gray-50 ${active ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''}`}
        >
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                {patient?.avatar ? <img src={patient.avatar} className="w-full h-full object-cover" alt="" /> : <User size={18} className="text-gray-400 m-auto mt-3" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{patient?.fullName}</p>
                <p className={`text-xs ${STATUS_MAP[conv.status]?.color}`}>{STATUS_MAP[conv.status]?.label}</p>
                {conv.lastMessage && <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>}
            </div>
            {conv.unreadDoctor > 0 && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {conv.unreadDoctor}
                </span>
            )}
        </button>
    );
}

function DoctorChatWindow({ conv, currentUserId, socket, onAccepted, onRefresh }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [accepting, setAccepting] = useState(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const { refreshUnread } = useSocket();
    const { callUser } = useWebRTC();

    useEffect(() => {
        if (!conv) return;
        setLoading(true);
        apiClient.get(`/api/conversations/${conv._id}/messages`)
            .then(res => { setMessages(res.data.metadata?.messages || []); refreshUnread(); })
            .catch(() => antMsg.error('Lỗi tải tin nhắn'))
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

    useEffect(() => {
        if (!socket || !conv) return;
        const handler = (msg) => {
            if (msg.conversationId === conv._id) {
                setMessages(prev => [...prev, msg]);
                refreshUnread();
            }
        };
        socket.on('receive_message', handler);
        return () => socket.off('receive_message', handler);
    }, [socket, conv?._id]);

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await apiClient.put(`/api/conversations/${conv._id}/accept`);
            // Phát socket event để bệnh nhân nhận được realtime
            socket?.emit('accept_conversation', {
                conversationId: conv._id,
                patientId: conv.patientId?._id,
            });
            antMsg.success('Đã chấp nhận cuộc trò chuyện!');
            onAccepted(conv._id);
        } catch (err) {
            antMsg.error(err.response?.data?.message || 'Lỗi');
        } finally {
            setAccepting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            antMsg.error('Vui lòng chọn file hình ảnh!');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            antMsg.error('Kích thước ảnh tối đa là 5MB!');
            return;
        }
        setImage(file);
    };

    const handleSend = async () => {
        if (!text.trim() && !image) return;
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
            antMsg.error(err.response?.data?.message || 'Lỗi gửi tin nhắn');
        }
    };

    const patient = conv.patientId;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {patient?.avatar ? <img src={patient.avatar} className="w-full h-full object-cover" alt="" /> : <User size={16} className="text-gray-400 m-auto mt-2.5" />}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{patient?.fullName}</p>
                    <p className={`text-xs ${STATUS_MAP[conv.status]?.color}`}>{STATUS_MAP[conv.status]?.label}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {conv.status === 'pending' ? (
                        <button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-60 transition"
                        >
                            <CheckCircle size={13} /> {accepting ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => callUser(patient?._id, 'audio', patient?.fullName)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition"
                            >
                                <Phone size={15} />
                            </button>
                            <button 
                                onClick={() => callUser(patient?._id, 'video', patient?.fullName)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition"
                            >
                                <Video size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {loading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-teal-500" size={28} /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center pt-10">
                        <MessageSquare size={40} className="text-gray-200 mx-auto mb-2" />
                        {conv.status === 'pending'
                            ? <p className="text-gray-400 text-sm">Bệnh nhân đang chờ bạn chấp nhận cuộc trò chuyện</p>
                            : <p className="text-gray-400 text-sm">Bắt đầu cuộc trò chuyện!</p>
                        }
                    </div>
                ) : messages.map(msg => {
                    const isMe = msg.senderRole === 'doctor';
                    return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe ? 'bg-teal-600 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                            }`}>
                                {msg.image && (
                                    <div className="mb-2">
                                        <Image src={msg.image} className="rounded-lg max-h-60 object-contain" />
                                    </div>
                                )}
                                {msg.content && <p>{msg.content}</p>}
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-teal-200' : 'text-gray-400'}`}>
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
                        <Bell size={15} /> Hãy chấp nhận để bắt đầu trò chuyện
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
                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition flex-shrink-0"
                            >
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="text"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text.trim() && !image}
                                className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-50 transition flex-shrink-0"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DoctorMessages() {
    const { dataUser } = useContext(Context);
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeConv, setActiveConv] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await apiClient.get('/api/conversations/my');
            setConversations(res.data.metadata || []);
        } catch {}
    }, []);

    useEffect(() => { fetchConversations().finally(() => setLoading(false)); }, []);

    // Lắng nghe tin nhắn mới và yêu cầu mới để hiện badge
    useEffect(() => {
        if (!socket) return;
        const handler = () => fetchConversations();
        socket.on('receive_message', handler);
        socket.on('new_conversation', handler);
        return () => {
            socket.off('receive_message', handler);
            socket.off('new_conversation', handler);
        };
    }, [socket]);

    const handleAccepted = (convId) => {
        setConversations(prev => prev.map(c => c._id === convId ? { ...c, status: 'accepted' } : c));
        setActiveConv(prev => prev?._id === convId ? { ...prev, status: 'accepted' } : prev);
        setActiveTab('accepted');
    };

    const pendingList = conversations.filter(c => c.status === 'pending');
    const acceptedList = conversations.filter(c => c.status === 'accepted');
    const displayList = activeTab === 'pending' ? pendingList : acceptedList;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={24} className="text-teal-500" /> Tin nhắn
                </h1>
                <p className="text-gray-400 text-sm mt-1">Quản lý và trò chuyện với bệnh nhân</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '70vh' }}>
                <div className="flex h-full">
                    {/* Sidebar */}
                    <div className={`w-full sm:w-72 border-r border-gray-100 flex flex-col flex-shrink-0 ${mobileShowChat ? 'hidden sm:flex' : 'flex'}`}>
                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex-1 py-3 text-xs font-semibold transition-colors ${activeTab === 'pending' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Yêu cầu mới
                                {pendingList.length > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px]">{pendingList.length}</span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('accepted')}
                                className={`flex-1 py-3 text-xs font-semibold transition-colors ${activeTab === 'accepted' ? 'text-teal-600 border-b-2 border-teal-500' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Đang trò chuyện
                                {acceptedList.filter(c => c.unreadDoctor > 0).length > 0 && (
                                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-500 text-white text-[10px]">
                                        {acceptedList.filter(c => c.unreadDoctor > 0).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
                            ) : displayList.length === 0 ? (
                                <div className="text-center pt-12 px-4">
                                    <MessageSquare size={36} className="text-gray-200 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">
                                        {activeTab === 'pending' ? 'Không có yêu cầu mới' : 'Chưa có cuộc trò chuyện nào'}
                                    </p>
                                </div>
                            ) : displayList.map(conv => (
                                <ConversationItem
                                    key={conv._id}
                                    conv={conv}
                                    active={activeConv?._id === conv._id}
                                    onClick={() => { setActiveConv(conv); setMobileShowChat(true); }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Chat */}
                    <div className={`flex-1 flex flex-col min-w-0 ${mobileShowChat ? 'flex' : 'hidden sm:flex'}`}>
                        {activeConv ? (
                            <>
                                <button className="sm:hidden flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border-b border-gray-100" onClick={() => setMobileShowChat(false)}>
                                    <ChevronLeft size={16} /> Quay lại
                                </button>
                                <DoctorChatWindow
                                    conv={activeConv}
                                    currentUserId={dataUser?._id}
                                    socket={socket}
                                    onAccepted={handleAccepted}
                                    onRefresh={fetchConversations}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <MessageSquare size={56} className="text-gray-200 mb-4" />
                                <h3 className="font-bold text-gray-700 mb-1">Chọn một cuộc trò chuyện</h3>
                                <p className="text-gray-400 text-sm">Chấp nhận yêu cầu từ bệnh nhân để bắt đầu</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
