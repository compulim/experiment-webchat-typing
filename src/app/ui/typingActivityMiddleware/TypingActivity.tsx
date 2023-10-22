import { memo } from 'react';

import { type WebChatTypingActivity } from './WebChatTypingActivity';

type Props = {
  activity: WebChatTypingActivity;
};

export default memo(function TypingActivity({ activity }: Props) {
  return <div className="webchat__typing-activity">{activity.text}</div>;
});
