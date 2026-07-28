import crypto from 'crypto';

export function getConversationId(user1Id: string, user2Id: string): string {
  const sortedPair = [user1Id, user2Id].sort().join('_');
  return crypto.createHash('sha256').update(sortedPair).digest('hex');
}