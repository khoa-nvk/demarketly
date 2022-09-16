/**
 * Browser helper functions
 */
import { NoBrowserFoundError } from "../errors.mjs";
export const getBrowserAPI = function () {
  let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  const {
    chrome,
    browser
  } = window; // Chrome, Opera support

  if (typeof chrome !== 'undefined' && chrome === Object(chrome)) return chrome; // Firefox support

  if (typeof browser !== 'undefined' && browser === Object(browser)) return browser;
  if (!force) throw new NoBrowserFoundError();
  return {};
};
export const isInIframe = () => window !== window.parent;
/**
 * RPC helper functions
 */

export const sendMessage = connection => {
  let messageId = 0;
  return function (_ref) {
    let {
      id,
      method,
      params,
      result,
      error
    } = _ref;
    let isNotificationOrResponse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    // Increment id for each request
    isNotificationOrResponse || (messageId += 1);
    id = isNotificationOrResponse ? id || null : messageId;
    const msgData = params ? {
      params
    } : result ? {
      result
    } : {
      error
    };
    connection.sendMessage({
      jsonrpc: '2.0',
      ...(id ? {
        id
      } : {}),
      method,
      ...msgData
    });
    return id;
  };
};
export const getHandler = function (schema, msg) {
  let {
    debug = false
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const handler = schema[msg.method];

  if (!handler || typeof handler !== 'function') {
    debug && console.log(`Unknown message method ${msg.method}`);
    return () => async () => true;
  }

  return handler;
};
export const message = function (method) {
  let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    method,
    params
  };
};
export const responseMessage = function (id, method) {
  let {
    error,
    result
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return {
    id,
    method,
    ...(error ? {
      error
    } : {
      result
    })
  };
};
export const sendResponseMessage = client => (id, method, data) => client.sendMessage(responseMessage(id, method, data), true);
export const isValidAccounts = accounts => ['', 'connected', 'current'].filter(k => typeof (k ? accounts[k] : accounts) === 'object').length === 3;
//# sourceMappingURL=helpers.mjs.map