import './WebChat.css';

import { Components, createStore } from 'botframework-webchat';
import { type ActivityMiddleware } from 'botframework-webchat-api';
import { memo, useEffect, useMemo, useState } from 'react';
import { type WebChatActivity } from 'botframework-webchat-core';

import createDirectLineEmulator from '../util/createDirectLineEmulator';
import createMessageUpdateActivityMiddleware from './messageUpdateActivityMiddleware/createMessageUpdateActivityMiddleware';
import createTypingActivityMiddleware from './typingActivityMiddleware/createTypingActivityMiddleware';
import emulateTypingWithoutOverlap from './emulator/emulateTypingWithOverlap';
import emulateMessageUpdate from './emulator/emulateMessageUpdate';

const { BasicWebChat, Composer } = Components;

type Props = Readonly<{ activities: readonly WebChatActivity[] }>;

// const TYPING_ACTIVITY_ID = 'a-t00001';
// const TYPING_INTERVAL = 50;
// const TYPING_TEXT =
//   'Incididunt labore culpa ex nulla. Occaecat aute sit eiusmod enim veniam dolor esse quis minim anim culpa eu duis Lorem. Sit sunt aliquip deserunt laborum ipsum excepteur sunt tempor veniam do culpa ullamco. Aliqua ipsum tempor laborum in velit deserunt dolor magna minim adipisicing minim. Ipsum sunt incididunt nisi esse ad reprehenderit in aute aliqua commodo magna minim ullamco mollit. Commodo tempor qui nulla Lorem aliqua aute mollit.';

const TOKENS = [
  'Alfa',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliett',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'Xray',
  'Yankee',
  'Zulu'
];

export default memo(function Chat({ activities }: Props) {
  const [ready, setReady] = useState(false);
  const activityMiddleware = useMemo<ActivityMiddleware>(
    () => () => {
      const messageUpdate = createMessageUpdateActivityMiddleware()();
      const typing = createTypingActivityMiddleware()();

      return next => action => messageUpdate(typing(next))(action);
    },
    []
  );
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
    })();

    return () => abortController.abort();
  }, [activities, directLine, ready]);

  useEffect(() => {
    const abortController = new AbortController();

    (async function () {
      const { signal } = abortController;
      const assertContinue = () => {
        if (abortController.signal.aborted) {
          throw new Error('Aborted.');
        }
      };

      for (; !signal.aborted; ) {
        const { activity, resolveAll } = await directLine.actPostActivity(() => {});

        assertContinue();

        (async function () {
          const echoBackActivity = await resolveAll();

          assertContinue();

          console.log(echoBackActivity);

          if (activity.type === 'message' && activity.text === '1') {
            await emulateTypingWithoutOverlap(directLine, TOKENS.join(' '), { outOfOrderInterval: 0 });
          } else {
            await emulateMessageUpdate(directLine, TOKENS.join(' '), { outOfOrderInterval: 0 });
          }
        })();
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
