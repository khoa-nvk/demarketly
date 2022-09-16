/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
import _websocket from 'websocket';
const {
  w3cwebsocket: W3CWebSocket
} = _websocket;
import _events from 'events';
const {
  EventEmitter
} = _events;
import JsonBig from "../utils/json-big.mjs";
import { pascalToSnake } from "../utils/string.mjs";
import { ChannelCallError, ChannelPingTimedOutError, UnknownChannelStateError } from "../utils/errors.mjs"; // Send ping message every 10 seconds

const PING_TIMEOUT_MS = 10000; // Close connection if pong message is not received within 5 seconds

const PONG_TIMEOUT_MS = 5000;
export const options = new WeakMap();
export const status = new WeakMap();
export const state = new WeakMap();
const fsm = new WeakMap();
const websockets = new WeakMap();
export const eventEmitters = new WeakMap();
const messageQueue = new WeakMap();
const messageQueueLocked = new WeakMap();
const actionQueue = new WeakMap();
const actionQueueLocked = new WeakMap();
const sequence = new WeakMap();
export const channelId = new WeakMap();
const rpcCallbacks = new WeakMap();
const pingTimeoutId = new WeakMap();
const pongTimeoutId = new WeakMap();
export const fsmId = new WeakMap();
export function emit(channel) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  eventEmitters.get(channel).emit(...args);
}

function enterState(channel, nextState) {
  if (!nextState) {
    throw new UnknownChannelStateError();
  }

  fsm.set(channel, nextState);

  if (nextState.handler.enter) {
    nextState.handler.enter(channel);
  }

  dequeueAction(channel);
}

export function changeStatus(channel, newStatus) {
  const prevStatus = status.get(channel);

  if (newStatus !== prevStatus) {
    status.set(channel, newStatus);
    emit(channel, 'statusChanged', newStatus);
  }
}
export function changeState(channel, newState) {
  state.set(channel, newState);
  emit(channel, 'stateChanged', newState);
}
export function send(channel, message) {
  const {
    debug = false
  } = options.get(channel);
  if (debug) console.log('Send message: ', message);
  websockets.get(channel).send(JsonBig.stringify(message));
}
export function enqueueAction(channel, guard, action) {
  actionQueue.set(channel, [...(actionQueue.get(channel) || []), {
    guard,
    action
  }]);
  dequeueAction(channel);
}

async function dequeueAction(channel) {
  const locked = actionQueueLocked.get(channel);
  const queue = actionQueue.get(channel) || [];

  if (locked || !queue.length) {
    return;
  }

  const state = fsm.get(channel);
  const index = queue.findIndex(item => item.guard(channel, state));

  if (index === -1) {
    return;
  }

  actionQueue.set(channel, queue.filter((_, i) => index !== i));
  actionQueueLocked.set(channel, true);
  const nextState = await Promise.resolve(queue[index].action(channel, state));
  actionQueueLocked.set(channel, false);
  enterState(channel, nextState);
}

async function handleMessage(channel, message) {
  const {
    handler,
    state
  } = fsm.get(channel);
  enterState(channel, await Promise.resolve(handler(channel, message, state)));
}

async function dequeueMessage(channel) {
  if (messageQueueLocked.get(channel)) return;
  const messages = messageQueue.get(channel);
  if (!messages.length) return;
  messageQueueLocked.set(channel, true);

  while (messages.length) {
    const message = messages.shift();

    try {
      await handleMessage(channel, message);
    } catch (error) {
      console.error('Error handling incoming message:');
      console.error(message);
      console.error(error);
    }
  }

  messageQueueLocked.set(channel, false);
}

function ping(channel) {
  clearTimeout(pingTimeoutId.get(channel));
  clearTimeout(pongTimeoutId.get(channel));
  pingTimeoutId.set(channel, setTimeout(() => {
    send(channel, {
      jsonrpc: '2.0',
      method: 'channels.system',
      params: {
        action: 'ping'
      }
    });
    pongTimeoutId.set(channel, setTimeout(() => {
      disconnect(channel);
      emit(channel, 'error', new ChannelPingTimedOutError());
    }, PONG_TIMEOUT_MS));
  }, PING_TIMEOUT_MS));
}

function onMessage(channel, data) {
  const message = JsonBig.parse(data);
  const {
    debug = false
  } = options.get(channel);
  if (debug) console.log('Receive message: ', message);

  if (message.id) {
    const callback = rpcCallbacks.get(channel).get(message.id);

    try {
      callback(message);
    } finally {
      rpcCallbacks.get(channel).delete(message.id);
    }

    return;
  }

  if (message.method === 'channels.message') {
    emit(channel, 'message', message.params.data.message);
    return;
  }

  if (message.method === 'channels.system.pong') {
    if (message.params.channel_id === channelId.get(channel) || // Skip channelId check if channelId is not known yet
    channelId.get(channel) == null) {
      ping(channel);
    }

    return;
  }

  messageQueue.get(channel).push(message);
  dequeueMessage(channel);
}

export function call(channel, method, params) {
  return new Promise((resolve, reject) => {
    const id = sequence.set(channel, sequence.get(channel) + 1).get(channel);
    rpcCallbacks.get(channel).set(id, message => {
      if (message.result) return resolve(message.result);

      if (message.error) {
        const [{
          message: details
        } = {}] = message.error.data || [];
        return reject(new ChannelCallError(message.error.message + (details ? `: ${details}` : '')));
      }
    });
    send(channel, {
      jsonrpc: '2.0',
      method,
      id,
      params
    });
  });
}
export function disconnect(channel) {
  websockets.get(channel).close();
  clearTimeout(pingTimeoutId.get(channel));
  clearTimeout(pongTimeoutId.get(channel));
}
export async function initialize(channel, connectionHandler, openHandler, _ref) {
  let {
    url,
    ...channelOptions
  } = _ref;
  options.set(channel, channelOptions);
  fsm.set(channel, {
    handler: connectionHandler
  });
  eventEmitters.set(channel, new EventEmitter());
  sequence.set(channel, 0);
  rpcCallbacks.set(channel, new Map());
  messageQueue.set(channel, []);
  const wsUrl = new URL(url);
  Object.entries(channelOptions).filter(_ref2 => {
    let [key] = _ref2;
    return !['sign', 'debug'].includes(key);
  }).forEach(_ref3 => {
    let [key, value] = _ref3;
    return wsUrl.searchParams.set(pascalToSnake(key), value);
  });
  wsUrl.searchParams.set('protocol', 'json-rpc');
  changeStatus(channel, 'connecting');
  const ws = new W3CWebSocket(wsUrl.toString());
  await new Promise((resolve, reject) => Object.assign(ws, {
    onerror: reject,
    onopen: () => {
      resolve();
      changeStatus(channel, 'connected');

      if (channelOptions.reconnectTx) {
        enterState(channel, {
          handler: openHandler
        });
        setTimeout(async () => changeState(channel, (await call(channel, 'channels.get.offchain_state', {})).signed_tx));
      }

      ping(channel);
    },
    onclose: () => {
      changeStatus(channel, 'disconnected');
      clearTimeout(pingTimeoutId.get(channel));
      clearTimeout(pongTimeoutId.get(channel));
    },
    onmessage: _ref4 => {
      let {
        data
      } = _ref4;
      return onMessage(channel, data);
    }
  }));
  websockets.set(channel, ws);
}
//# sourceMappingURL=internal.mjs.map