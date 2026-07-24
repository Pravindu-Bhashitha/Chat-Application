import * as messageRepo from '../repository/message.repository';

const messageService = {
  async createMessage(senderId: string, receiverId: string, content: string) { 
    return await messageRepo.createMessage(senderId, receiverId, content);
  },

  async getConversation(user1Id: string, user2Id: string) {
    return await messageRepo.getConversation(user1Id, user2Id);
  },
};

export default messageService;