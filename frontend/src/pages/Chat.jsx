import { useState, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import { useAuth } from '../services/authService';
import "../App.css";

export default function Chat() {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    fetch("http://localhost:3000/api/messages")
      .then((response) => response.json())
      .then((data) => {
        const validMessages = data.filter(msg => msg && typeof msg === 'object');
        setMessages(validMessages);
      })
      .catch((error) => console.error("Erro ao buscar mensagens:", error));

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Conectado ao servidor");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Desconectado do servidor");
    });

    newSocket.on("new_message", (message) => {
      if (message && typeof message === 'object') {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              msg.id === message.id || 
              (msg.isTemporary && msg.content === message.content && msg.userId === message.userId)
          );
          return exists ? prev : [...prev, message];
        });
      }
    });


    newSocket.on("error", (error) => {
      console.error("Erro no socket:", error);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket && user?.id) {
      const messageData = {
        userId: user.id,
        content: inputMessage.trim(),
        name: user.name,
        message_type: "text",
      };

      const tempMessage = {
        id: `temp-${Date.now()}`,
        idUser: user.id,
        content: inputMessage.trim(),
        name: user.name,
        created_at: new Date().toISOString(),
        isTemporary: true,
      };

      setMessages((prev) => [...prev, tempMessage]);

      socket.emit("send_message", messageData);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="no-messages">
          Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
        </div>
      );
    }

    return messages.map((message, index) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const messageUserId = message.userId || message.idUser || "unknown";
      const messageContent = message.content || "";
      const userName = message.name || message.user_name || "Usuário desconhecido";
      const messageDate =
        message.created_at || message.createdAt || message.timestamp || new Date();

      return (
        <div
          key={message.id || index}
          className={`message ${messageUserId === user?.id ? "user" : "other"}`}
        >
          <div className="user-id">
            {userName} {message.isTemporary}
          </div>
          <div>{messageContent}</div>
          <div className="timestamp">{formatDate(messageDate)}</div>
        </div>
      );
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Chat em Tempo Real</h1>
        <div className="status">
          <span
            className={`connection-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          ></span>
          {isConnected ? "Conectado" : "Desconectado"} | Seu ID: {user?.id || 'N/A'}
          <button className="logout-btn" onClick={logout} style={{marginLeft: '80px'}}>
            <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
          </button>
        </div>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        {renderMessages()}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={!isConnected}
        />
        <button onClick={sendMessage} disabled={!isConnected || !inputMessage.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}