import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User as UserIcon, Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/context/I18nContext";
import { messagesAPI } from "@/services/api";
import { socketService } from "@/services/socket";

interface ChatMessage {
    sender: string;
    content: string;
    timestamp?: string;
}

export const ChatWindow = ({ receiverId, receiverName }: { receiverId: string, receiverName: string }) => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [remoteTyping, setRemoteTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (user && receiverId) {
            // Load conversation history
            messagesAPI.getConversation(receiverId)
                .then(({ data }) => {
                    const msgs = data.messages || data;
                    setMessages(Array.isArray(msgs) ? msgs : []);
                })
                .catch((err: unknown) => console.error("Failed to load messages:", err));
            
            // Connect to socket if not already connected
            if (user.id && !socketService.isConnected()) {
                socketService.connect(user.id);
            }
            
            // Listen for incoming messages
            socketService.onReceiveMessage((message) => {
                setMessages(prev => [...prev, message]);
            });
            
            // Listen for typing indicators
            socketService.onUserTyping((data) => {
                if (data.senderId === receiverId) {
                    setRemoteTyping(true);
                }
            });
            
            socketService.onUserStoppedTyping((data) => {
                if (data.senderId === receiverId) {
                    setRemoteTyping(false);
                }
            });
        }
        
        return () => {
            socketService.off('receive_message');
            socketService.off('user_typing');
            socketService.off('user_stopped_typing');
        };
    }, [user, receiverId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const { data } = await messagesAPI.sendMessage({
                receiver: receiverId,
                content: newMessage
            });
            
            setMessages([...messages, data]);
            setNewMessage("");
            
            // Send real-time message via socket
            socketService.sendMessage(receiverId, data);
            socketService.stopTyping(receiverId);
            setIsTyping(false);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        
        if (!isTyping) {
            setIsTyping(true);
            socketService.startTyping(receiverId);
        }
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.stopTyping(receiverId);
        }, 2000);
    };

    return (
        <Card className="h-[500px] flex flex-col border-primary/20 shadow-xl">
            <CardHeader className="bg-primary text-white py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-md">{t('chat_with')} {receiverName}</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === user?.id
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none"
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </CardContent>

            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-muted/30">
                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={remoteTyping ? `${receiverName} is typing...` : t('type_message')}
                    className="bg-white border-primary/20"
                />
                <Button type="submit" size="icon" className="shrink-0 bg-primary text-white">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </Card>
    );
};
