import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useWebRTC } from '../context/WebRTCContext';

class RingtonePlayer {
    constructor() {
        this.audioCtx = null;
        this.interval = null;
    }
    
    play() {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        const beep = () => {
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
            osc.frequency.setValueAtTime(600, this.audioCtx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.5);
        };
        
        this.interval = setInterval(() => {
            beep();
            setTimeout(beep, 200);
        }, 1500);
        
        beep();
        setTimeout(beep, 200);
    }
    
    stop() {
        if (this.interval) clearInterval(this.interval);
        if (this.audioCtx) {
            this.audioCtx.close().catch(console.error);
            this.audioCtx = null;
        }
    }
}

export default function IncomingCallAlert() {
    const { call, callAccepted, answerCall, rejectCall } = useWebRTC();
    const playerRef = useRef(null);

    // Phát chuông khi có cuộc gọi đến
    useEffect(() => {
        if (call.isReceivingCall && !callAccepted) {
            if (!playerRef.current) playerRef.current = new RingtonePlayer();
            playerRef.current.play();
        } else {
            if (playerRef.current) {
                playerRef.current.stop();
                playerRef.current = null;
            }
        }
        return () => {
            if (playerRef.current) {
                playerRef.current.stop();
            }
        };
    }, [call.isReceivingCall, callAccepted]);

    if (!call.isReceivingCall || callAccepted) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-slide-down duration-500">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-primary-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse">
                    {call.avatar ? (
                        <img src={call.avatar} alt="caller" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white font-bold text-xl">
                            {call.name?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
                <div className="flex-1 pt-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Cuộc gọi đến</p>
                    <h4 className="text-gray-900 font-bold text-base truncate">{call.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        {call.type === 'video' ? <Video size={14} className="text-primary-500"/> : <Phone size={14} className="text-primary-500"/>}
                        {call.type === 'video' ? 'Gọi Video WebRTC' : 'Gọi Thoại WebRTC'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
                <button 
                    onClick={rejectCall}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <PhoneOff size={16} /> Từ chối
                </button>
                <button 
                    onClick={answerCall}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200"
                >
                    <Phone size={16} className="animate-pulse" /> Trả lời
                </button>
            </div>
        </div>
    );
}
