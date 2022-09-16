export const VERSION = 1;
export let MESSAGE_DIRECTION;

(function (MESSAGE_DIRECTION) {
  MESSAGE_DIRECTION["to_waellet"] = "to_waellet";
  MESSAGE_DIRECTION["to_aepp"] = "to_aepp";
})(MESSAGE_DIRECTION || (MESSAGE_DIRECTION = {}));

export let WALLET_TYPE;

(function (WALLET_TYPE) {
  WALLET_TYPE["window"] = "window";
  WALLET_TYPE["extension"] = "extension";
})(WALLET_TYPE || (WALLET_TYPE = {}));

export let SUBSCRIPTION_TYPES;

(function (SUBSCRIPTION_TYPES) {
  SUBSCRIPTION_TYPES["subscribe"] = "subscribe";
  SUBSCRIPTION_TYPES["unsubscribe"] = "unsubscribe";
})(SUBSCRIPTION_TYPES || (SUBSCRIPTION_TYPES = {}));

export let METHODS;

(function (METHODS) {
  METHODS["readyToConnect"] = "connection.announcePresence";
  METHODS["updateAddress"] = "address.update";
  METHODS["address"] = "address.get";
  METHODS["connect"] = "connection.open";
  METHODS["sign"] = "transaction.sign";
  METHODS["signMessage"] = "message.sign";
  METHODS["subscribeAddress"] = "address.subscribe";
  METHODS["updateNetwork"] = "networkId.update";
  METHODS["closeConnection"] = "connection.close";
})(METHODS || (METHODS = {}));

export let RPC_STATUS;

(function (RPC_STATUS) {
  RPC_STATUS["CONNECTED"] = "CONNECTED";
  RPC_STATUS["NODE_BINDED"] = "NODE_BINDED";
  RPC_STATUS["DISCONNECTED"] = "DISCONNECTED";
  RPC_STATUS["CONNECTION_REJECTED"] = "CONNECTION_REJECTED";
  RPC_STATUS["WAITING_FOR_CONNECTION_APPROVE"] = "WAITING_FOR_CONNECTION_APPROVE";
  RPC_STATUS["WAITING_FOR_CONNECTION_REQUEST"] = "WAITING_FOR_CONNECTION_REQUEST";
})(RPC_STATUS || (RPC_STATUS = {}));

export const ERRORS = {
  broadcastFailed: function () {
    let error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      code: 3,
      data: error,
      message: 'Broadcast failed'
    };
  },
  invalidTransaction: function () {
    let error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      code: 2,
      data: error,
      message: 'Invalid transaction'
    };
  },
  rejectedByUser: function () {
    let error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      code: 4,
      data: error,
      message: 'Operation rejected by user'
    };
  },
  connectionDeny: function () {
    let error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      code: 9,
      data: error,
      message: 'Wallet deny your connection request'
    };
  },
  permissionDeny: address => ({
    code: 11,
    message: `You are not subscribed for account ${address}`
  }),
  internalError: message => ({
    code: 12,
    message
  }),
  notAuthorize: () => ({
    code: 10,
    message: 'You are not connected to the wallet'
  }),
  unsupportedProtocol: () => ({
    code: 5,
    message: 'Unsupported Protocol Version'
  }),
  unsupportedNetwork: () => ({
    code: 8,
    message: 'Unsupported Network'
  })
};
//# sourceMappingURL=schema.mjs.map