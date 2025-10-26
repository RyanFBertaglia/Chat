import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Conectado ao servidor");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Desconectado do servidor");
    });

    newSocket.on("error", (error) => {
      console.error("Erro no socket:", error);
    });

    return () => newSocket.close();
  }, []);

  return { socket, isConnected };
}