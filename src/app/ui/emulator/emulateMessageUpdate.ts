import mathRandom from 'math-random';

import { type WebChatMessageUpdateActivity } from '../messageUpdateActivityMiddleware/WebChatMessageUpdateActivity';
import type createDirectLineEmulator from '../../util/createDirectLineEmulator';
import uniqueActivityId from './private/uniqueActivityId';

const BOT_ID = 'bot';
const DEFAULT_CHUNK_INTERVAL_IN_MILLISECONDS = 100;
const DEFAULT_DELIMITER_PATTERN = /\s/g;
const DEFAULT_OUT_OF_ORDER_INTERVAL = 500;

type Init = {
  chunkIntervalInMilliseconds?: number;
  delimiterPattern?: RegExp;
  outOfOrderInterval?: number;
};

export default async function emulateMessageUpdate(
  directLine: ReturnType<typeof createDirectLineEmulator>['directLine'],
  text: string,
  init: Init = {}
) {
  await directLine.emulateIncomingActivity({
    text: 'Emulate streaming via "messageUpdate".',
    type: 'message'
  });

  const {
    chunkIntervalInMilliseconds = DEFAULT_CHUNK_INTERVAL_IN_MILLISECONDS,
    delimiterPattern = DEFAULT_DELIMITER_PATTERN,
    outOfOrderInterval = DEFAULT_OUT_OF_ORDER_INTERVAL
  } = init;
  const id = uniqueActivityId();

  const promises: Promise<void>[] = [];

  const runningPattern = new RegExp(delimiterPattern);
  let match: null | RegExpExecArray;
  let index = 0;

  while ((match = runningPattern.exec(text))) {
    const token = text.substring(0, match.index);

    promises.push(
      new Promise(resolve =>
        setTimeout(
          () => {
            directLine.emulateIncomingActivity({
              from: { id: BOT_ID, role: 'bot' },
              id,
              text: token,
              type: index ? 'messageUpdate' : 'message'
            } as WebChatMessageUpdateActivity);

            resolve();
          },
          chunkIntervalInMilliseconds * index++ + mathRandom() * outOfOrderInterval
        )
      )
    );
  }

  promises.push(
    new Promise(resolve =>
      setTimeout(
        () => {
          directLine.emulateIncomingActivity({
            from: { id: BOT_ID, role: 'bot' },
            id,
            text,
            type: 'messageUpdate'
          } as WebChatMessageUpdateActivity);

          resolve();
        },
        chunkIntervalInMilliseconds * index + mathRandom() * outOfOrderInterval
      )
    )
  );

  await Promise.all(promises);
}
