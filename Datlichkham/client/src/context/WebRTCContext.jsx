import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSocket } from './SocketContext';
import Context from '../store/Context';

const WebRTCContext = createContext(null);

export function WebRTCProvider({ children }) {
    const { socket } = useSocket() || {};
    const { dataUser } = useContext(Context);

    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [call, setCall] = useState({ isReceivingCall: false, from: '', name: '', signal: null, type: 'video' });
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const connectionRef = useRef(null);
    const localStreamRef = useRef(null); // Giữ ref để tắt dễ dàng
    const pendingCandidates = useRef([]); // Hàng đợi ICE candidates

    // Lắng nghe socket
    useEffect(() => {
        if (!socket) return;

        socket.on('incoming_call', ({ from, signal, callerInfo }) => {
            const { name, type, avatar } = callerInfo || {};
            setCall({ isReceivingCall: true, from, name, signal, type: type || 'video', avatar });
        });

        socket.on('call_rejected', () => {
            setCallEnded(true);
            setIsCalling(false);
            cleanup();
        });

        socket.on('call_ended', () => {
            setCallEnded(true);
            cleanup();
        });

        const handleIceCandidate = async (candidate) => {
            try {
                if (connectionRef.current && connectionRef.current.remoteDescription) {
                    await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                    pendingCandidates.current.push(candidate);
                }
            } catch (e) {
                console.error('Lỗi add ICE', e);
            }
        };

        socket.on('ice_candidate', handleIceCandidate);

        return () => {
            socket.off('incoming_call');
            socket.off('call_rejected');
            socket.off('call_ended');
            socket.off('ice_candidate', handleIceCandidate);
        };
    }, [socket]);

    const getMedia = async (isVideo) => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
            setStream(currentStream);
            localStreamRef.current = currentStream;
            if (myVideo.current) myVideo.current.srcObject = currentStream;
            return currentStream;
        } catch (err) {
            console.error('Lỗi lấy thiết bị:', err);
            return null;
        }
    };

    const cleanup = () => {
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setStream(null);
        setRemoteStream(null);
        setCall({ isReceivingCall: false, from: '', name: '', signal: null, type: 'video', userToCall: null });
        setCallAccepted(false);
        setCallEnded(false);
        setIsCalling(false);
        pendingCandidates.current = [];
    };

    const callUser = async (idToCall, type = 'video', targetName = '') => {
        setIsCalling(true);
        setCall(prev => ({ ...prev, userToCall: idToCall, name: targetName, type }));
        
        const myStream = await getMedia(type === 'video');
        if (!myStream) {
            setIsCalling(false);
            return;
        }

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });
        connectionRef.current = peer;

        myStream.getTracks().forEach(track => peer.addTrack(track, myStream));

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', { to: idToCall, candidate: event.candidate });
            }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit('call_user', {
            userToCall: idToCall,
            signalData: offer,
            from: dataUser?._id,
            callerInfo: { name: dataUser?.fullName, avatar: dataUser?.avatar, type }
        });

        socket.once('call_accepted', async (signal) => {
            setCallAccepted(true);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
            while (pendingCandidates.current.length > 0) {
                const candidate = pendingCandidates.current.shift();
                await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
            }
        });
    };

    const answerCall = async () => {
        setCallAccepted(true);
        const myStream = await getMedia(call.type === 'video');
        
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });
        connectionRef.current = peer;

        if (myStream) {
            myStream.getTracks().forEach(track => peer.addTrack(track, myStream));
        }

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', { to: call.from, candidate: event.candidate });
            }
        };

        await peer.setRemoteDescription(new RTCSessionDescription(call.signal));
        while (pendingCandidates.current.length > 0) {
            const candidate = pendingCandidates.current.shift();
            await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
        }

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('answer_call', { to: call.from, signal: answer });
    };

    const rejectCall = () => {
        socket.emit('reject_call', { to: call.from });
        cleanup();
    };

    const leaveCall = () => {
        socket.emit('end_call', { to: call.from || call.userToCall });
        cleanup();
    };

    return (
        <WebRTCContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            remoteStream,
            callEnded,
            isCalling,
            callUser,
            answerCall,
            rejectCall,
            leaveCall
        }}>
            {children}
        </WebRTCContext.Provider>
    );
}

export const useWebRTC = () => useContext(WebRTCContext);
