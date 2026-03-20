import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User as UserIcon, Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/context/I18nContext";

export const ChatWindow = ({ receiverId, receiverName }: { receiverId: string, receiverName: string }) => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && receiverId) {
            fetch(`/api/messages/${receiverId}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            })
                .then(res => res.json())
                .then(data => setMessages(data));
        }
    }, [user, receiverId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    receiver: receiverId,
                    content: newMessage
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessages([...messages, data]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Failed to send message");
        }
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
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('type_message')}
                    className="bg-white border-primary/20"
                />
                <Button type="submit" size="icon" className="shrink-0 bg-primary text-white">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </Card>
    );
};
