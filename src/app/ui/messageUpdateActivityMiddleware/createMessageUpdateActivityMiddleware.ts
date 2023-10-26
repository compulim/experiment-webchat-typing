import { type ActivityMiddleware } from 'botframework-webchat-api';
import { type WebChatMessageUpdateActivity } from './WebChatMessageUpdateActivity';

export default function createTypingActivityMiddleware(): ActivityMiddleware {
  return () => next => options => {
    const { activity } = options;

    // If the chat history does not contains an existing message with same ID, then, the messageUpdate activity should be ignored.
    // This cannot be easily done in middleware yet.
    if ((activity.type as string) === 'messageUpdate') {
      return next({
        ...options,
        activity: {
          ...options.activity,
          type: 'message'
        } as WebChatMessageUpdateActivity
      });
    }

    return next(options);
  };
}
