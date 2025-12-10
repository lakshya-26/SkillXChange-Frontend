import { io, Socket } from "socket.io-client";
import { API_URLS } from "../utils/constants";
import { authService } from "./auth.service";

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): void {
    const token = authService.getAccessToken();

    if (!token) {
      console.warn("Cannot connect to socket: No token found");
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    this.socket = io(API_URLS.COMMUNICATION_SERVICE, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinConversation(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("join_conversation", conversationId);
  }

  public sendMessage(data: { conversationId: string; content: string }): void {
    if (!this.socket) return;
    this.socket.emit("send_message", data);
  }

  public startTyping(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("typing_start", { conversationId });
  }

  public stopTyping(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("typing_stop", { conversationId });
  }

  public on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) {
      // If not connected, try to connect, but maybe defer binding?
      // For now, assume connect() is called before components mount or in a useEffect
      console.warn("Socket not initialized when calling on()");
      return () => {};
    }
    this.socket.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }

  // Helper for notification specifically
  public onNotification(callback: (notification: any) => void): () => void {
    return this.on("new_notification", callback);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = SocketService.getInstance();
