import { io, type Socket } from "socket.io-client";

import type { Message } from "./api";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function connectChatSocket(onMessage: (message: Message) => void): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = window.localStorage.getItem("accessToken");

  if (!accessToken) {
    return null;
  }

  const socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect_error", (error) => {
    console.error("Chat socket connection error:", error.message);
  });

  socket.on("newMessage", onMessage);

  return socket;
}
