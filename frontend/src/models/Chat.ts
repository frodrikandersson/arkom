export type OnOpenChatFunction = (
  conversationId: number,
  otherUserId: string,
  otherUserName?: string,
  otherUserAvatar?: string,
  otherUserUsername?: string
) => void;

export interface OpenChat {
  conversationId: number;
  otherUserId: string;
  otherUserName?: string;
  otherUserUsername?: string;
  otherUserAvatar?: string;
  isMinimized: boolean;
}
