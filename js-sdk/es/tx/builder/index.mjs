import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;
import BigNumber from 'bignumber.js';
import _rlp from 'rlp';
const {
  decode: rlpDecode,
  encode: rlpEncode
} = _rlp;
import { AE_AMOUNT_FORMATS, formatAmount } from "../../utils/amount-formatter.mjs";
import { hash } from "../../utils/crypto.mjs";
import { Field } from "./field-types.mjs";
import { DEFAULT_FEE, FIELD_TYPES, OBJECT_ID_TX_TYPE, TX_DESERIALIZATION_SCHEMA, TX_FEE_BASE_GAS, TX_FEE_OTHER_GAS, TX_SERIALIZATION_SCHEMA, TX_TYPE, VSN } from "./schema.mjs";
import { readInt, readId, readPointers, writeId, writeInt, buildPointers, encode, decode } from "./helpers.mjs";
import { toBytes } from "../../utils/bytes.mjs";
import MPTree from "../../utils/mptree.mjs";
import { InvalidTxParamsError, SchemaNotFoundError } from "../../utils/errors.mjs";
/**
 * JavaScript-based Transaction builder
 * @module @aeternity/aepp-sdk/es/tx/builder
 * @export TxBuilder
 * @example import { TxBuilder } from '@aeternity/aepp-sdk'
 */

const ORACLE_TTL_TYPES = {
  delta: 'delta',
  block: 'block'
}; // SERIALIZE AND DESERIALIZE PART

function deserializeField(value, type, prefix) {
  if (!value) return '';

  switch (type) {
    case FIELD_TYPES.ctVersion:
      {
        const [vm,, abi] = value;
        return {
          vmVersion: readInt(_Buffer.from([vm])),
          abiVersion: readInt(_Buffer.from([abi]))
        };
      }

    case FIELD_TYPES.amount:
    case FIELD_TYPES.int:
      return readInt(value);

    case FIELD_TYPES.id:
      return readId(value);

    case FIELD_TYPES.ids:
      return value.map(readId);

    case FIELD_TYPES.bool:
      return value[0] === 1;

    case FIELD_TYPES.binary:
      return encode(value, prefix);

    case FIELD_TYPES.stateTree:
      return encode(value, 'ss');

    case FIELD_TYPES.string:
      return value.toString();

    case FIELD_TYPES.payload:
      return encode(value, 'ba');

    case FIELD_TYPES.pointers:
      return readPointers(value);

    case FIELD_TYPES.rlpBinary:
      return unpackTx(value, true);

    case FIELD_TYPES.rlpBinaries:
      return value.map(v => unpackTx(v, true));

    case FIELD_TYPES.rawBinary:
      return value;

    case FIELD_TYPES.hex:
      return value.toString('hex');

    case FIELD_TYPES.offChainUpdates:
      return value.map(v => unpackTx(v, true));

    case FIELD_TYPES.callStack:
      // TODO: fix this
      return [readInt(value)];

    case FIELD_TYPES.mptrees:
      return value.map(t => new MPTree(t));

    case FIELD_TYPES.callReturnType:
      switch (readInt(value)) {
        case '0':
          return 'ok';

        case '1':
          return 'error';

        case '2':
          return 'revert';

        default:
          return value;
      }

    case FIELD_TYPES.sophiaCodeTypeInfo:
      return value.reduce((acc, _ref) => {
        let [funHash, fnName, argType, outType] = _ref;
        return { ...acc,
          [fnName.toString()]: {
            funHash,
            argType,
            outType
          }
        };
      }, {});

    default:
      if (type.prototype instanceof Field) return type.deserialize(value);
      return value;
  }
}

function serializeField(value, type, prefix, params) {
  var _value$rlpEncoded;

  switch (type) {
    case FIELD_TYPES.amount:
    case FIELD_TYPES.int:
      return writeInt(value);

    case FIELD_TYPES.id:
      return writeId(value);

    case FIELD_TYPES.ids:
      return value.map(writeId);

    case FIELD_TYPES.bool:
      return _Buffer.from([value ? 1 : 0]);

    case FIELD_TYPES.binary:
      return decode(value, prefix);

    case FIELD_TYPES.stateTree:
      return decode(value, 'ss');

    case FIELD_TYPES.hex:
      return _Buffer.from(value, 'hex');

    case FIELD_TYPES.signatures:
      return value.map(_Buffer.from);

    case FIELD_TYPES.payload:
      return typeof value === 'string' && value.split('_')[0] === 'ba' ? decode(value, 'ba') : toBytes(value);

    case FIELD_TYPES.string:
      return toBytes(value);

    case FIELD_TYPES.pointers:
      return buildPointers(value);

    case FIELD_TYPES.rlpBinary:
      return (_value$rlpEncoded = value.rlpEncoded) !== null && _value$rlpEncoded !== void 0 ? _value$rlpEncoded : value;

    case FIELD_TYPES.mptrees:
      return value.map(t => t.serialize());

    case FIELD_TYPES.ctVersion:
      return _Buffer.from([...toBytes(value.vmVersion), 0, ...toBytes(value.abiVersion)]);

    case FIELD_TYPES.callReturnType:
      switch (value) {
        case 'ok':
          return writeInt(0);

        case 'error':
          return writeInt(1);

        case 'revert':
          return writeInt(2);

        default:
          return value;
      }

    default:
      if (type.prototype instanceof Field) return type.serialize(value, params);
      return value;
  }
}

function validateField(value, type, prefix) {
  // All fields are required
  if (value === undefined || value === null) return 'Field is required'; // Validate type of value

  switch (type) {
    case FIELD_TYPES.amount:
    case FIELD_TYPES.int:
      {
        if (isNaN(value) && !BigNumber.isBigNumber(value)) {
          return `${value} is not of type Number or BigNumber`;
        }

        if (new BigNumber(value).lt(0)) return `${value} must be >= 0`;
        return;
      }

    case FIELD_TYPES.id:
      {
        const prefixes = Array.isArray(prefix) ? prefix : [prefix];

        if (!prefixes.includes(value.split('_')[0])) {
          return `'${value}' prefix doesn't match expected prefix '${prefix}'`;
        }

        return;
      }

    case FIELD_TYPES.ctVersion:
      if (!(value !== null && value !== void 0 && value.abiVersion) || !(value !== null && value !== void 0 && value.vmVersion)) {
        return 'Value must be an object with "vmVersion" and "abiVersion" fields';
      }

      return;

    case FIELD_TYPES.pointers:
      if (!Array.isArray(value)) return 'Value must be of type Array';

      if (value.some(p => !(p !== null && p !== void 0 && p.key) || !(p !== null && p !== void 0 && p.id))) {
        return 'Value must contains only object\'s like \'{key: "account_pubkey", id: "ak_lkamsflkalsdalksdlasdlasdlamd"}\'';
      }

      if (value.length > 32) {
        return `Expected 32 pointers or less, got ${value.length} instead`;
      }

  }
}

function transformParams(params, schema) {
  let {
    denomination
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  params = schema.filter(_ref2 => {
    let [_, t] = _ref2;
    return t === FIELD_TYPES.amount;
  }).reduce((acc, _ref3) => {
    let [key] = _ref3;
    return { ...params,
      [key]: formatAmount(params[key], {
        denomination
      })
    };
  }, params);
  const schemaKeys = schema.map(_ref4 => {
    let [k] = _ref4;
    return k;
  });
  return Object.entries(params).reduce((acc, _ref5) => {
    let [key, value] = _ref5;
    if (schemaKeys.includes(key)) acc[key] = value;

    if (['oracleTtl', 'queryTtl', 'responseTtl'].includes(key)) {
      acc[`${key}Type`] = value.type === ORACLE_TTL_TYPES.delta ? 0 : 1;
      acc[`${key}Value`] = value.value;
    }

    return acc;
  }, {});
} // INTERFACE


function getOracleRelativeTtl(params, txType) {
  const ttlKey = {
    [TX_TYPE.oracleRegister]: 'oracleTtl',
    [TX_TYPE.oracleExtend]: 'oracleTtl',
    [TX_TYPE.oracleQuery]: 'queryTtl',
    [TX_TYPE.oracleResponse]: 'responseTtl'
  }[txType];

  if (params[ttlKey] || params[`${ttlKey}Value`]) {
    return params[`${ttlKey}Value`] || params[ttlKey].value;
  }

  return 1;
}
/**
 * Calculate min fee
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder/index
 * @rtype (txType, { gas = 0, params }) => String
 * @param {String} txType - Transaction type
 * @param {Options} options - Options object
 * @param {String|Number} options.gas - Gas amount
 * @param {Object} options.params - Tx params
 * @return {String|Number}
 * @example calculateMinFee('spendTx', { gas, params })
 */


export function calculateMinFee(txType, _ref6) {
  let {
    gas = 0,
    params,
    vsn
  } = _ref6;
  const multiplier = BigNumber(1e9); // 10^9 GAS_PRICE

  if (!params) return BigNumber(DEFAULT_FEE).times(multiplier).toString(10);
  let actualFee = buildFee(txType, {
    params: { ...params,
      fee: 0
    },
    multiplier,
    gas,
    vsn
  });
  let expected = BigNumber(0);

  while (!actualFee.eq(expected)) {
    actualFee = buildFee(txType, {
      params: { ...params,
        fee: actualFee
      },
      multiplier,
      gas,
      vsn
    });
    expected = actualFee;
  }

  return expected.toString(10);
}
/**
 * Calculate fee based on tx type and params
 * @param txType
 * @param params
 * @param gas
 * @param multiplier
 * @param vsn
 * @return {BigNumber}
 */

function buildFee(txType, _ref7) {
  let {
    params,
    gas = 0,
    multiplier,
    vsn
  } = _ref7;
  const {
    rlpEncoded: txWithOutFee
  } = buildTx({ ...params
  }, txType, {
    vsn
  });
  const txSize = txWithOutFee.length;
  return TX_FEE_BASE_GAS(txType).plus(TX_FEE_OTHER_GAS(txType, txSize, {
    relativeTtl: getOracleRelativeTtl(params, txType),
    innerTxSize: [TX_TYPE.gaMeta, TX_TYPE.payingFor].includes(txType) ? params.tx.tx.encodedTx.rlpEncoded.length : 0
  })).times(multiplier);
}
/**
 * Calculate fee
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @rtype (fee, txType, gas = 0) => String
 * @param {String|Number} fee - fee
 * @param {String} txType - Transaction type
 * @param {Options} options - Options object
 * @param {String|Number} options.gas - Gas amount
 * @param {Object} options.params - Tx params
 * @return {String|Number}
 * @example calculateFee(null, 'spendTx', { gas, params })
 */


export function calculateFee() {
  let fee = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  let txType = arguments.length > 1 ? arguments[1] : undefined;
  let {
    gas = 0,
    params,
    showWarning = true,
    vsn
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!params && showWarning) console.warn(`Can't build transaction fee, we will use DEFAULT_FEE(${DEFAULT_FEE})`);
  return fee || calculateMinFee(txType, {
    params,
    gas,
    vsn
  });
}
/**
 * Validate transaction params
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {Object} params Object with tx params
 * @param {Array} schema Transaction schema
 * @param {Array} excludeKeys  Array of keys to exclude for validation
 * @return {Object} Object with validation errors
 */

export function validateParams(params, schema, _ref8) {
  let {
    excludeKeys = []
  } = _ref8;
  return Object.fromEntries(schema // TODO: allow optional keys in schema
  .filter(_ref9 => {
    let [key] = _ref9;
    return !excludeKeys.includes(key) && !['payload', 'nameFee', 'deposit'].includes(key);
  }).map(_ref10 => {
    let [key, type, prefix] = _ref10;
    return [key, validateField(params[key], type, prefix)];
  }).filter(_ref11 => {
    let [, message] = _ref11;
    return message;
  }));
}
/**
 * Build binary transaction
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {Object} params Object with tx params
 * @param {Array} schema Transaction schema
 * @param {Object} [options={}] options
 * @param {String[]} [options.excludeKeys=[]] Array of keys to exclude for validation and build
 * @param {String} [options.denomination='aettos'] Denomination of amounts
 * @throws {Error} Validation error
 * @return {Array} Array with binary fields of transaction
 */

export function buildRawTx(params, schema) {
  let {
    excludeKeys = [],
    denomination = AE_AMOUNT_FORMATS.AETTOS
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const filteredSchema = schema.filter(_ref12 => {
    let [key] = _ref12;
    return !excludeKeys.includes(key);
  }); // Transform `amount` type fields to `aettos`

  params = transformParams(params, filteredSchema, {
    denomination
  }); // Validation

  const valid = validateParams(params, schema, {
    excludeKeys
  });

  if (Object.keys(valid).length) {
    throw new InvalidTxParamsError('Transaction build error. ' + JSON.stringify(valid));
  }

  return filteredSchema.map(_ref13 => {
    let [key, fieldType, prefix] = _ref13;
    return serializeField(params[key], fieldType, prefix, params);
  });
}
/**
 * Unpack binary transaction
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {Array} binary Array with binary transaction field's
 * @param {Array} schema Transaction schema
 * @return {Object} Object with transaction field's
 */

export function unpackRawTx(binary, schema) {
  return schema.reduce((acc, _ref14, index) => {
    let [key, fieldType, prefix] = _ref14;
    return Object.assign(acc, {
      [key]: deserializeField(binary[index], fieldType, prefix)
    });
  }, {});
}
/**
 * Get transaction serialization/deserialization schema
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {{ vsn: String, objId: Number, type: String }}
 * @throws {Error} Schema not found error
 * @return {Object} Schema
 */

const getSchema = _ref15 => {
  let {
    vsn,
    objId,
    type
  } = _ref15;
  const isDeserialize = !!objId;
  const firstKey = isDeserialize ? objId : type;
  const schema = isDeserialize ? TX_DESERIALIZATION_SCHEMA : TX_SERIALIZATION_SCHEMA;

  if (!schema[firstKey]) {
    throw new SchemaNotFoundError(`Transaction ${isDeserialize ? 'deserialization' : 'serialization'} not implemented for ${isDeserialize ? 'tag ' + objId : type}`);
  }

  if (!schema[firstKey][vsn]) {
    throw new SchemaNotFoundError(`Transaction ${isDeserialize ? 'deserialization' : 'serialization'} not implemented for ${isDeserialize ? 'tag ' + objId : type} version ${vsn}`);
  }

  return schema[firstKey][vsn];
};
/**
 * Build transaction hash
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {Object} params Object with tx params
 * @param {String} type Transaction type
 * @param {Object} [options={}] options
 * @param {String[]} [options.excludeKeys] Array of keys to exclude for validation and build
 * @param {String} [options.prefix] Prefix of transaction
 * @throws {Error} Validation error
 * @returns {Object} object
 * @returns {String} object.tx Base64Check transaction hash with 'tx_' prefix
 * @returns {Buffer} object.rlpEncoded rlp encoded transaction
 * @returns {Array<Buffer>} object.binary binary transaction
 */


export function buildTx(params, type) {
  let {
    excludeKeys = [],
    prefix = 'tx',
    vsn = VSN,
    denomination = AE_AMOUNT_FORMATS.AETTOS
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const [schema, tag] = getSchema({
    type,
    vsn
  });
  const binary = buildRawTx({ ...params,
    VSN: vsn,
    tag
  }, schema, {
    excludeKeys,
    denomination: params.denomination || denomination
  }).filter(e => e !== undefined);
  const rlpEncoded = rlpEncode(binary);
  const tx = encode(rlpEncoded, prefix);
  return {
    tx,
    rlpEncoded,
    binary,
    txObject: unpackRawTx(binary, schema)
  };
}
/**
 * Unpack transaction hash
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {String|Buffer} encodedTx String or RLP encoded transaction array
 * (if fromRlpBinary flag is true)
 * @param {Boolean} fromRlpBinary Unpack from RLP encoded transaction (default: false)
 * @param {String} prefix - Prefix of data
 * @returns {Object} object
 * @returns {Object} object.tx Object with transaction param's
 * @returns {Buffer} object.rlpEncoded rlp encoded transaction
 * @returns {Array<Buffer>} object.binary binary transaction
 */

export function unpackTx(encodedTx) {
  let fromRlpBinary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  let prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'tx';
  const rlpEncoded = fromRlpBinary ? encodedTx : decode(encodedTx, prefix);
  const binary = rlpDecode(rlpEncoded);
  const objId = readInt(binary[0]);
  const vsn = readInt(binary[1]);
  const [schema] = getSchema({
    objId,
    vsn
  });
  return {
    txType: OBJECT_ID_TX_TYPE[objId],
    tx: unpackRawTx(binary, schema),
    rlpEncoded,
    binary
  };
}
/**
 * Build a transaction hash
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder
 * @param {String | Buffer} rawTx base64 or rlp encoded transaction
 * @return {String} Transaction hash
 */

export function buildTxHash(rawTx) {
  const data = typeof rawTx === 'string' && rawTx.startsWith('tx_') ? decode(rawTx, 'tx') : rawTx;
  return encode(hash(data), 'th');
}
export default {
  calculateMinFee,
  calculateFee,
  unpackTx,
  unpackRawTx,
  buildTx,
  buildRawTx,
  validateParams,
  buildTxHash
};
//# sourceMappingURL=index.mjs.map