import { setSendBox } from 'botframework-webchat-core';
import React, { ChangeEventHandler, useCallback, useState } from 'react';

import Chat from './Chat';

const Main = () => {
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState<string>();

  const handleSubmitClick = useCallback(() => setSubmitted(true), [setSendBox]);
  const handleToken = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => setToken(value),
    [setToken]
  );

  return submitted && token ? (
    <Chat token={token} />
  ) : (
    <form>
      <input onChange={handleToken} type="textbox" value={token} />
      <button disabled={!token} onClick={handleSubmitClick} type="button">
        Start chat
      </button>
    </form>
  );
};

export default Main;
