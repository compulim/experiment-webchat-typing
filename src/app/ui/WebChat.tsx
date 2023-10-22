import './WebChat.css';

import { Components, createStore } from 'botframework-webchat';
import { memo, useEffect, useMemo, useState } from 'react';
import { type WebChatActivity } from 'botframework-webchat-core';

import createDirectLineEmulator from '../util/createDirectLineEmulator';
import createTypingActivityMiddleware from './typingActivityMiddleware/createTypingActivityMiddleware';
import sleep from '../util/private/sleep';
import { type WebChatTypingActivity } from './typingActivityMiddleware/WebChatTypingActivity';

const { BasicWebChat, Composer } = Components;

type Props = Readonly<{ activities: readonly WebChatActivity[] }>;

const TYPING_ACTIVITY_ID = 'a-t00001';
const TYPING_INTERVAL = 50;
const TYPING_TEXT =
  'Incididunt labore culpa ex nulla. Occaecat aute sit eiusmod enim veniam dolor esse quis minim anim culpa eu duis Lorem. Sit sunt aliquip deserunt laborum ipsum excepteur sunt tempor veniam do culpa ullamco. Aliqua ipsum tempor laborum in velit deserunt dolor magna minim adipisicing minim. Ipsum sunt incididunt nisi esse ad reprehenderit in aute aliqua commodo magna minim ullamco mollit. Commodo tempor qui nulla Lorem aliqua aute mollit ullamco nulla nulla cillum culpa tempor quis. Adipisicing ipsum anim nostrud sunt duis laborum magna culpa excepteur dolore ad ut ullamco.';

export default memo(function Chat({ activities }: Props) {
  const [ready, setReady] = useState(false);
  const activityMiddleware = useMemo(() => createTypingActivityMiddleware(), []);
  const store = useMemo(
    () =>
      createStore({}, () => (next: (action: unknown) => unknown) => (action: { type: string }) => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          setReady(true);
        }

        return next(action);
      }),
    [setReady]
  );

  const { directLine } = useMemo(() => createDirectLineEmulator({ store }), [store]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const abortController = new AbortController();
    const assertContinue = () => {
      if (abortController.signal.aborted) {
        throw new Error('Aborted.');
      }
    };

    (async function () {
      for (const activity of activities) {
        assertContinue();

        await directLine.emulateIncomingActivity(activity);
      }

      assertContinue();

      for (let counter = 0, match, pattern = /\s/gu; counter < 1000 && (match = pattern.exec(TYPING_TEXT)); counter++) {
        const token = TYPING_TEXT.substring(0, match.index);

        await directLine.emulateIncomingActivity({
          from: { id: '', role: 'bot' },
          id: TYPING_ACTIVITY_ID,
          text: token,
          type: 'typing'
        } as WebChatTypingActivity);

        assertContinue();

        await sleep(TYPING_INTERVAL, abortController.signal);
      }

      await directLine.emulateIncomingActivity({
        from: { id: '', role: 'bot' },
        id: TYPING_ACTIVITY_ID,
        text: TYPING_TEXT,
        type: 'message'
      });
    })();

    return () => abortController.abort();
  }, [activities, directLine, ready]);

  useEffect(() => {
    const abortController = new AbortController();

    (async function () {
      const { signal } = abortController;

      for (; !signal.aborted; ) {
        const { resolveAll } = await directLine.actPostActivity(() => {});

        if (signal.aborted) {
          break;
        }

        const echoBackActivity = await resolveAll();

        console.log(echoBackActivity);
      }
    })();

    return () => abortController.abort();
  }, [directLine]);

  return (
    <div className="chat">
      <Composer activityMiddleware={activityMiddleware} directLine={directLine} store={store}>
        <BasicWebChat />
      </Composer>
    </div>
  );
});
