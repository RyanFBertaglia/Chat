import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [userId, setUserId] = useState(`user_${Math.floor(Math.random() * 1000)}`)
  const [isConnected, setIsConnected] = useState(false)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })
    
    setSocket(newSocket)

    // Busca mensagens iniciais
    fetch('http://localhost:3000/api/messages')
      .then(response => response.json())
      .then(data => setMessages(data))
      .catch(error => console.error('Erro ao buscar mensagens:', error))

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Conectado ao servidor')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Desconectado do servidor')
    })

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('error', (error) => {
      console.error('Erro no socket:', error)
    })

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      const messageData = {
        userId: userId,
        content: inputMessage.trim(),
        nome: 'Ryan',
        message_type: 'text'
      }
      
      socket.emit('send_message', messageData)
      setInputMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Chat em Tempo Real</h1>
        <div className="status">
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Conectado' : 'Desconectado'} | Seu ID: {userId}
        </div>
      </div>
      
      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="no-messages">
            Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.user_name === userId ? 'user' : 'other'}`}>
              <div className="user-id">{message.userId}</div>
              <div>{message.content}</div>
              <div className="timestamp">
                {formatDate(message.createdAt || new Date())}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          Enviar
        </button>
      </div>
    </div>
  )
}

export default App