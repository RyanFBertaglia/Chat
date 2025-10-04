const backendUrl = "http://localhost:3000";

export const messageService = {
  async fetchMessages() {
    try {
      const response = await fetch(`${backendUrl}/api/messages`);
      const data = await response.json();
      return data.filter(msg => msg && typeof msg === 'object');
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
  },

  createTempMessage(user, content) {
    return {
      id: `temp-${Date.now()}`,
      idUser: user.id,
      content: content.trim(),
      name: user.name,
      created_at: new Date().toISOString(),
      isTemporary: true,
    };
  },

  prepareMessageData(user, content) {
    return {
      userId: user.id,
      content: content.trim(),
      name: user.name,
      message_type: "text",
    };
  }
};