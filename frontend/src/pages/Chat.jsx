import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useAuth } from '../services/useAuth';
import { useNavigate } from "react-router-dom";
import MyAccount from "../components/MyAccount";
import "../App.css";

const backendUrl = "http://localhost:3000";
const photoCache = new Map();

function MessageItem({ message, currentUserId, getUserPhoto }) {
  const [photoUrl, setPhotoUrl] = useState("/default.png");

  // CORREÇÃO: Usar idUser que vem do servidor (base de dados)
  const messageUserId = message.idUser || message.userId || "unknown";
  const messageContent = message.content || "";
  const userName = message.name || message.user_name || "Usuário desconhecido";
  const messageDate = message.created_at || message.createdAt || message.timestamp || new Date();

  useEffect(() => {
    let mounted = true;

    // Só busca foto se tiver um ID válido
    if (messageUserId && messageUserId !== "unknown") {
      getUserPhoto(messageUserId).then((url) => {
        if (mounted) setPhotoUrl(url);
      });
    }

    return () => { mounted = false };
  }, [messageUserId, getUserPhoto]);

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

  return (
    <div className={`message ${messageUserId === currentUserId ? "user" : "other"}`}>
      <div className="message-header">
        <img
          src={photoUrl}
          alt="Foto do usuário"
          className="user-photo"
          onError={(e) => {
            e.target.src = "/default.png";
          }}
        />
        <div className="user-id">{userName}</div>
      </div>
      <div>{messageContent}</div>
      <div className="timestamp">{formatDate(messageDate)}</div>
    </div>
  );
}

export default function Chat() {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // CORREÇÃO: Função simplificada e estável para buscar fotos
  const getUserPhoto = useCallback(async (userId) => {
    if (!userId || userId === "unknown" || userId === "null" || userId === "undefined") {
      return "/default.png";
    }

    if (photoCache.has(userId)) {
      return photoCache.get(userId);
    }

    try {
      const response = await fetch(`${backendUrl}/api/user/${userId}/photo`);

      if (!response.ok) {
        if (response.status === 404) {
          photoCache.set(userId, "/default.png");
          return "/default.png";
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.url) {
        const fullUrl = `${backendUrl}${data.data.url}`;
        photoCache.set(userId, fullUrl);
        return fullUrl;
      } else {
        throw new Error("Formato de resposta inválido da API");
      }
    } catch (error) {
      console.error(`Erro ao buscar foto do usuário ${userId}:`, error.message);
      photoCache.set(userId, "/default.png");
      return "/default.png";
    }
  }, []);

  useEffect(() => {
    const newSocket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    // Buscar mensagens iniciais
    fetch(`${backendUrl}/api/messages`)
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
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket && user?.id) {
      console.log(`user= ${user.id}`);
      const messageData = {
        userId: user.id,
        content: inputMessage.trim(),
        name: user.name,
        message_type: "text",
      };

      const tempMessage = {
        id: `temp-${Date.now()}`,
        idUser: user.id, // Usar o ID real do usuário
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

      return (
        <MessageItem
          key={message.id || `message-${index}`}
          message={message}
          currentUserId={user?.id}
          getUserPhoto={getUserPhoto}
        />
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
          {isConnected ? "Conectado" : "Desconectado"}
          <button className="logout-btn" onClick={logout} style={{marginLeft: '200px'}}>
            <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
          </button>
          <button className="logout-btn" onClick={() => setShowMyAccount(true)} style={{marginLeft: '20px'}}>
            <i className="fa fa-user" aria-hidden="true"></i> Minha Conta
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
      {showMyAccount && <MyAccount onClose={() => setShowMyAccount(false)} />}
    </div>
  );
}