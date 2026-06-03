import { io, Socket } from 'socket.io-client';

interface SocketMessage {
    sender: string;
    content: string;
    timestamp?: string;
}

interface TypingData {
    senderId: string;
}

class SocketService {
  private socket: Socket | null = null;
  private connected = false;

  connect(userId: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = localStorage.getItem('accessToken');

    this.socket = io(import.meta.env.VITE_SOCKET_URL || '', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || undefined,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.connected = true;
      // Server auto-joins user to their own room via JWT — no manual 'join' needed
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Chat events
  sendMessage(receiverId: string, message: SocketMessage) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('send_message', { receiverId, message });
  }

  onReceiveMessage(callback: (message: SocketMessage) => void) {
    if (!this.socket) return;
    this.socket.on('receive_message', callback);
  }

  // Typing indicators
  startTyping(receiverId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { receiverId });
  }

  stopTyping(receiverId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('stop_typing', { receiverId });
  }

  onUserTyping(callback: (data: TypingData) => void) {
    if (!this.socket) return;
    this.socket.on('user_typing', callback);
  }

  onUserStoppedTyping(callback: (data: TypingData) => void) {
    if (!this.socket) return;
    this.socket.on('user_stopped_typing', callback);
  }

  // Remove listeners
  off(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }
}

// Export singleton instance
export const socketService = new SocketService();
