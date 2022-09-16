export declare const VERSION = 1;
export declare const enum MESSAGE_DIRECTION {
    to_waellet = "to_waellet",
    to_aepp = "to_aepp"
}
export declare const enum WALLET_TYPE {
    window = "window",
    extension = "extension"
}
export declare const enum SUBSCRIPTION_TYPES {
    subscribe = "subscribe",
    unsubscribe = "unsubscribe"
}
export declare const enum METHODS {
    readyToConnect = "connection.announcePresence",
    updateAddress = "address.update",
    address = "address.get",
    connect = "connection.open",
    sign = "transaction.sign",
    signMessage = "message.sign",
    subscribeAddress = "address.subscribe",
    updateNetwork = "networkId.update",
    closeConnection = "connection.close"
}
export declare const enum RPC_STATUS {
    CONNECTED = "CONNECTED",
    NODE_BINDED = "NODE_BINDED",
    DISCONNECTED = "DISCONNECTED",
    CONNECTION_REJECTED = "CONNECTION_REJECTED",
    WAITING_FOR_CONNECTION_APPROVE = "WAITING_FOR_CONNECTION_APPROVE",
    WAITING_FOR_CONNECTION_REQUEST = "WAITING_FOR_CONNECTION_REQUEST"
}
export declare const ERRORS: {
    broadcastFailed: (error?: {}) => {
        code: number;
        data: {};
        message: string;
    };
    invalidTransaction: (error?: {}) => {
        code: number;
        data: {};
        message: string;
    };
    rejectedByUser: (error?: {}) => {
        code: number;
        data: {};
        message: string;
    };
    connectionDeny: (error?: {}) => {
        code: number;
        data: {};
        message: string;
    };
    permissionDeny: (address: string) => {
        code: number;
        message: string;
    };
    internalError: (message: string) => {
        code: number;
        message: string;
    };
    notAuthorize: () => {
        code: number;
        message: string;
    };
    unsupportedProtocol: () => {
        code: number;
        message: string;
    };
    unsupportedNetwork: () => {
        code: number;
        message: string;
    };
};
