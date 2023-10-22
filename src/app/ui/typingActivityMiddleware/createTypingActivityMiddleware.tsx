import { type ActivityMiddleware } from 'botframework-webchat-api';

import { type WebChatTypingActivity } from './WebChatTypingActivity';
import TypingActivity from './TypingActivity';

export default function createTypingActivityMiddleware(): ActivityMiddleware {
  return () => next => options => {
    const { activity } = options;

    if (activity.type === 'typing') {
      return () => <TypingActivity activity={activity as unknown as WebChatTypingActivity} />;
    }

    return next(options);
  };
}
