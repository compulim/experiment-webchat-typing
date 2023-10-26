import { type WebChatActivity } from 'botframework-webchat-core';

export type WebChatMessageUpdateActivity = WebChatActivity & { type: 'messageUpdate' };
