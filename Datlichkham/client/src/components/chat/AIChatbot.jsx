import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '../../config/axiosClient';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Chào bạn! Tôi là trợ lý y tế AI của MediCare+. Tôi có thể giúp gì cho bạn hôm nay? (Ví dụ: Tư vấn triệu chứng, hướng dẫn đặt lịch...)' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input.trim();
        setInput('');
        
        // Cập nhật UI với tin nhắn người dùng
        const newMessages = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Chuẩn bị history (format cho Gemini)
            const history = messages.slice(1).map(m => ({
                role: m.role,
                parts: m.text
            }));

            const res = await apiClient.post('/api/ai/chat', {
                message: userMsg,
                history
            });

            const reply = res.data.metadata.reply;
            setMessages([...newMessages, { role: 'model', text: reply }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'model', text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Nút mở Chatbot */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-primary-500 to-teal-400 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform relative group"
                >
                    <Bot size={28} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chat với AI ✦
                    </div>
                </button>
            )}

            {/* Cửa sổ Chatbot */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-teal-500 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-1">MediBot <Sparkles size={16} className="text-yellow-300"/></h3>
                                <p className="text-xs text-primary-100 font-medium">Trợ lý Y tế Trí tuệ Nhân tạo</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                        <Bot size={18} />
                                    </div>
                                )}
                                <div 
                                    className={`p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-primary-600 text-white rounded-tr-sm' 
                                            : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                        <User size={18} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2 text-gray-500 text-sm">
                                    <Loader2 size={16} className="animate-spin text-primary-500"/> AI đang phân tích...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Triệu chứng của bạn là gì?..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="w-11 h-11 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                            >
                                <Send size={18} className="ml-1" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">AI có thể mắc lỗi. Vui lòng tham khảo ý kiến bác sĩ.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
