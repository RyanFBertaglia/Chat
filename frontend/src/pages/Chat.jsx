import { useState, useEffect, useRef } from "react";
import { useAuth } from '../services/useAuth'; 
import { useSocket } from '../services/useSocket';
import { useNavigate } from "react-router-dom";
import MyAccount from "../components/MyAccount";
import "../App.css";
import MessageItem from "../components/MessageItem";
import { messageService } from "../services/messageService";

export default function Chat() {
  const { user, logout, getUserPhoto } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showMyAccount, setShowMyAccount] = useState(false);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messageService.fetchMessages()
      .then(setMessages)
      .catch((error) => console.error("Erro ao buscar mensagens:", error));
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
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
      };

      socket.on("new_message", handleNewMessage);

      return () => {
        socket.off("new_message", handleNewMessage);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket && user?.id) {
      console.log(`user= ${user.id}`);
      
      const messageData = messageService.prepareMessageData(user, inputMessage);
      const tempMessage = messageService.createTempMessage(user, inputMessage);

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