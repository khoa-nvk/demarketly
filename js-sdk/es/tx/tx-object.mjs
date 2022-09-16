import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;

/**
 * TxObject module
 * @module @aeternity/aepp-sdk/es/tx/tx-object
 * @export TxObject
 * @example import TxObject from '@aeternity/aepp-sdk/es/tx/tx-object'
 */
import stampit from '@stamp/it';
import { buildTx, calculateFee, unpackTx } from "./builder/index.mjs";
import { TX_TYPE } from "./builder/schema.mjs";
import { encode } from "./builder/helpers.mjs";
import { isHex } from "../utils/string.mjs";
import { InvalidTxError, TypeError, UnknownTxError, InvalidSignatureError } from "../utils/errors.mjs";
/**
 * Build transaction from object
 * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
 * @param {String} type Transaction type
 * @param {Object} params Transaction params
 * @param {Object} [options={}] Options
 * @throws {Error} Arguments validation error's
 * @return {{
 *   encodedTx: String, binary: Array<Buffer>, rlpEncoded: Buffer, params: Object, type: String
 * }}
 */

const buildTransaction = function (type, params) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (typeof params !== 'object') throw new TypeError('tx "params" should be an object');
  if (typeof type !== 'string' || !Object.values(TX_TYPE).includes(type)) throw new UnknownTxError(`Unknown transaction type ${type}`);
  const fee = calculateFee(params.fee, type, {
    gas: params.gas,
    params,
    vsn: params.vsn
  });
  const {
    rlpEncoded,
    binary,
    tx: encodedTx,
    txObject
  } = buildTx({ ...params,
    fee
  }, type, {
    vsn: params.vsn,
    ...options
  });
  return {
    rlpEncoded,
    binary,
    encodedTx,
    params: txObject,
    type
  };
};
/**
 * Unpack transaction from RLP encoded binary or base64c string
 * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
 * @param {Uint8Array|String} tx RLP encoded binary or base64c(rlpBinary) string
 * @throws {Error} Arguments validation error's
 * @return {{
 *   encodedTx: String, binary: Array<Buffer>, rlpEncoded: Buffer, type: String, params: Object
 * }}
 */


const unpackTransaction = tx => {
  if (!tx) throw new InvalidTxError(`Invalid transaction: ${tx}`);

  if (typeof tx === 'string') {
    const {
      txType: type,
      tx: params,
      rlpEncoded,
      binary
    } = unpackTx(tx);
    return {
      encodedTx: tx,
      type,
      params,
      rlpEncoded,
      binary
    };
  }

  if (tx instanceof Uint8Array) {
    const {
      txType: type,
      tx: params,
      rlpEncoded,
      binary
    } = unpackTx(tx, true);
    return {
      encodedTx: encode(tx, 'tx'),
      type,
      params,
      rlpEncoded,
      binary
    };
  }

  throw new InvalidTxError(`"tx" should be a string or Uint8Array, got ${tx} instead`);
};
/**
 * Helper which build or unpack transaction base on constructor arguments
 * Need to provide one of arguments: [tx] -> unpack flow or [params, type] -> build flow
 * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
 * @param {Buffer|String} [tx] Transaction rlp binary or vase64c string
 * @param {Object} params Transaction params
 * @param {String} type Transaction type
 * @param {Object} [options={}] Options
 * @throws {Error} Arguments validation error's
 * @return {{
 *   encodedTx: String, binary: Array<Buffer>, rlpEncoded: Buffer, type: String, params: Object
 * }}
 */


const initTransaction = function () {
  let {
    tx,
    params,
    type,
    options = {}
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (params && type) return buildTransaction(type, params, options);
  if (tx) return unpackTransaction(tx);
  throw new InvalidTxError('Invalid TxObject arguments. Please provide one of { tx: "tx_asdasd23..." } or { type: "spendTx", params: {...} }');
};
/**
 * Transaction Validator Stamp
 * This stamp give us possibility to unpack and validate some of transaction properties,
 * to make sure we can post it to the chain
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
 * @rtype Stamp
 * @param {Object} [options={}] - Initializer object
 * @param {Buffer|String} [options.tx] - Rlp binary or base64c transaction
 * @param {Object} [options.params] - Transaction params
 * @param {String} [options.type] - Transaction type
 * @param {Object} [options.options] - Build options
 * @return {Object} TxObject instance
 * @example TxObject({ params: {...}, type: 'spendTx' })
 */


export const TxObject = stampit({
  init() {
    let {
      tx,
      params,
      type,
      options = {}
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.options = options;
    this.signatures = [];
    Object.assign(this, initTransaction({
      tx,
      params,
      type,
      options
    }));

    if (this.type === TX_TYPE.signed) {
      const {
        signatures,
        encodedTx: {
          txType,
          tx
        }
      } = this.params;
      this.signatures = signatures;
      this.params = tx;
      this.type = txType;
      this.isSigned = true;
    }
  },

  statics: {
    /**
     * Create txObject from base64c RLP encoded transaction string with 'tx_' prefix
     * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
     * @static
     * @param {String} tx Transaction string (tx_23fsdgsdfg...)
     * @return {TxObject}
     */
    fromString: tx => TxObject({
      tx
    }),

    /**
     * Create txObject from transaction RLP binary
     * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
     * @static
     * @param {Buffer} tx Transaction RLP binary
     * @return {TxObject}
     */
    fromRlp: tx => TxObject({
      tx
    })
  },
  methods: {
    /**
     * Rebuild transaction with new params and recalculate fee
     * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
     * @param {Object} props Transaction properties for update
     * @param options
     * @return {TxObject}
     */
    setProp() {
      let props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (typeof props !== 'object') throw new TypeError('Props should be an object');
      this.isSigned = false;
      this.signatures = [];
      Object.assign(this, buildTransaction(this.type, { ...this.params,
        ...props,
        fee: null
      }, { ...this.options,
        ...options
      }));
      return this;
    },

    /**
     * Get signatures
     * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
     * @return {Array} Array of signatures
     */
    getSignatures() {
      return this.signatures;
    },

    /**
     * Add signature
     * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
     * @param {Buffer|String} signature Signature to add ( Can be: Buffer | Uint8Array | HexString )
     * @return {void}
     */
    addSignature(signature) {
      signature = isHex(signature) ? _Buffer.from(signature, 'hex') : signature;
      if (!_Buffer.isBuffer(signature) && !(signature instanceof Uint8Array)) throw new InvalidSignatureError('Invalid signature, signature must be of type Buffer or Uint8Array');
      Object.assign(this, buildTransaction(TX_TYPE.signed, {
        encodedTx: this.rlpEncoded,
        signatures: [[...this.signatures, signature]]
      }));
      const {
        signatures,
        encodedTx: {
          txType,
          tx
        }
      } = this.params;
      this.signatures = signatures;
      this.params = tx;
      this.type = txType;
      this.isSigned = true;
    },

    /**
     * Calculate fee
     * @alias module:@aeternity/aepp-sdk/es/tx/tx-object
     * @param {Object} props
     * @return {String} fee
     */
    calculateMinFee() {
      let props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      const params = { ...this.params,
        ...props
      };
      return calculateFee(0, this.type, {
        gas: params.gas,
        params,
        vsn: params.vsn
      });
    }

  }
});
export default TxObject;
//# sourceMappingURL=tx-object.mjs.map