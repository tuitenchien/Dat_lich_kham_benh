import { useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useWebRTC } from '../context/WebRTCContext';
import { useState } from 'react';

export default function CallModal() {
    const { 
        call, callAccepted, callEnded, isCalling, 
        myVideo, userVideo, stream, remoteStream, leaveCall 
    } = useWebRTC();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [stream, myVideo]);

    useEffect(() => {
        if (userVideo.current && remoteStream) {
            userVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream, userVideo]);

    if (!isCalling && !callAccepted) return null;

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!stream.getVideoTracks()[0].enabled);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center backdrop-blur-md animate-fade-in duration-300">
            {/* Header info */}
            <div className="absolute top-8 left-0 right-0 text-center animate-slide-down duration-500 delay-100">
                <h2 className="text-white text-2xl font-bold">
                    {isCalling && !callAccepted ? 'Đang gọi...' : (call.name || 'Đang gọi')}
                </h2>
                <p className="text-gray-400 mt-2">
                    {isCalling && !callAccepted ? 'Vui lòng chờ người dùng nhấc máy' : 'Đã kết nối'}
                </p>
            </div>

            {/* Video container */}
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 animate-zoom-in duration-500">
                
                {/* Remote Video */}
                {callAccepted && !callEnded ? (
                    <video 
                        playsInline 
                        ref={userVideo} 
                        autoPlay 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse flex items-center justify-center text-white text-3xl font-bold">
                            {call.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                )}

                {/* Local Video */}
                {stream && (
                    <div className="absolute bottom-6 right-6 w-32 md:w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700 z-10">
                        <video 
                            playsInline 
                            muted 
                            ref={myVideo} 
                            autoPlay 
                            className="w-full h-full object-cover transform -scale-x-100"
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80">
                                <VideoOff className="text-gray-400" size={24} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-6 animate-slide-up duration-500 delay-200">
                <button 
                    onClick={toggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                
                <button 
                    onClick={leaveCall}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-xl transition-all"
                >
                    <PhoneOff size={28} />
                </button>

                <button 
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
            </div>
        </div>
    );
}
