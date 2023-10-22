import { type WebChatActivity } from 'botframework-webchat-core';

export type WebChatTypingActivity = WebChatActivity & { text: string; type: 'typing' };
