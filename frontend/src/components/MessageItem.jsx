import { useState, useEffect } from "react";

const photoCache = new Map();

export default function MessageItem({ message, currentUserId, getUserPhoto }) {
  const [photoUrl, setPhotoUrl] = useState("/default.png");

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