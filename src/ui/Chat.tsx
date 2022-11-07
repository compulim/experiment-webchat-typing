import React, { FC, useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

const Chat: FC<{ token: string }> = ({ token }) => {
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  return (
    <ReactWebChat
      directLine={directLine}
      styleOptions={{
        suggestedActionLayout: 'flow'
      }}
    />
  );
};

export default Chat;
