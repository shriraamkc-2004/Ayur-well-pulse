import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    PhoneOff, 
    Monitor, 
    ShieldCheck, 
    Activity,
    Maximize2
} from "lucide-react";
import { toast } from "sonner";

interface TelehealthVideoProps {
    participantName: string;
    onClose: () => void;
}

export const TelehealthVideo = ({ participantName, onClose }: TelehealthVideoProps) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // Dynamic timer for call duration
    useEffect(() => {
        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Try to access user webcam for ultimate realism!
    useEffect(() => {
        if (!isVideoOff) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    setLocalStream(stream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.log("Webcam access declined or unavailable, showing high-end avatar simulation.", err);
                });
        } else {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
        }
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoOff]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        toast.success("Consultation session ended successfully.");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-6 text-white animate-fade-in">
            {/* Header / Connection Status */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            Live Consultation with {participantName}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Secure Video Consultation (Local Preview)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-mono text-sm">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    <span>{formatTime(callDuration)}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-emerald-400">HD Camera Active</span>
                </div>
            </div>

            {/* Main Video Grid */}
            <div className="flex-1 my-6 relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl">
                
                {/* Local Camera Feed (Full Screen) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950">
                    
                    {!isVideoOff && localStream ? (
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover transform -scale-x-100"
                        />
                    ) : (
                        <>
                            {/* Immersive pulsing graphic representing audio/presence */}
                            <div className="relative w-44 h-44 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6 animate-pulse">
                                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-5xl font-semibold text-primary">
                                    {participantName.split(" ").map(n => n[0]).join("")}
                                </div>
                                {/* Audio wave simulation rings */}
                                <div className="absolute inset-[-15px] border border-white/5 rounded-full animate-ping opacity-25"></div>
                                <div className="absolute inset-[-30px] border border-white/5 rounded-full animate-ping opacity-10"></div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white/90">{participantName}</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                {isMuted ? "Muted" : "Speaking..."}
                            </p>
                        </>
                    )}
                    
                    {/* Info overlay */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium">
                        📹 Your Camera (Local Preview)
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold">
                        ⚠️ Note: Peer-to-peer video calling requires WebRTC server setup
                    </div>
                </div>
            </div>

            {/* Controls panel */}
            <div className="flex justify-center items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-2xl mx-auto w-full backdrop-blur-md">
                <Button 
                    onClick={() => setIsMuted(prev => !prev)} 
                    variant="outline" 
                    size="icon" 
                    className={`w-14 h-14 rounded-full border-none transition-all duration-300 ${
                        isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button 
                    onClick={() => setIsVideoOff(prev => !prev)} 
                    variant="outline" 
                    size="icon" 
                    className={`w-14 h-14 rounded-full border-none transition-all duration-300 ${
                        isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>

                <Button 
                    onClick={() => {
                        setIsScreenSharing(prev => !prev);
                        toast.info(isScreenSharing ? "Screen sharing ended" : "Requesting screen permission...");
                    }} 
                    variant="outline" 
                    size="icon" 
                    className={`w-14 h-14 rounded-full border-none transition-all duration-300 ${
                        isScreenSharing ? "bg-primary text-white hover:bg-primary/95" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                >
                    <Monitor className="h-6 w-6" />
                </Button>

                <Button 
                    onClick={handleEndCall} 
                    variant="destructive" 
                    size="icon" 
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/30 hover:scale-105 transition-all duration-300"
                >
                    <PhoneOff className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
};
