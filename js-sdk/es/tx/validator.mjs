import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;
import { verify, hash } from "../utils/crypto.mjs";
import { encode, decode } from "./builder/helpers.mjs";
import BigNumber from 'bignumber.js';
import { MIN_GAS_PRICE, PROTOCOL_VM_ABI, TX_TYPE } from "./builder/schema.mjs";
import { calculateFee, unpackTx } from "./builder/index.mjs";
import { UnsupportedProtocolError } from "../utils/errors.mjs";
/**
 * Transaction validator
 * @module @aeternity/aepp-sdk/es/tx/validator
 * @export verifyTransaction
 * @example import { verifyTransaction } from '@aeternity/aepp-sdk'
 */

const validators = [(_ref, _ref2) => {
  let {
    encodedTx,
    signatures
  } = _ref;
  let {
    account,
    node,
    parentTxTypes
  } = _ref2;
  if ((encodedTx !== null && encodedTx !== void 0 ? encodedTx : signatures) === undefined) return [];
  if (signatures.length !== 1) return []; // TODO: Support multisignature?

  const prefix = _Buffer.from([node.nodeNetworkId, ...(parentTxTypes.includes(TX_TYPE.payingFor) ? ['inner_tx'] : [])].join('-'));

  const txWithNetworkId = _Buffer.concat([prefix, encodedTx.rlpEncoded]);

  const txHashWithNetworkId = _Buffer.concat([prefix, hash(encodedTx.rlpEncoded)]);

  const decodedPub = decode(account.id, 'ak');
  if (verify(txWithNetworkId, signatures[0], decodedPub) || verify(txHashWithNetworkId, signatures[0], decodedPub)) return [];
  return [{
    message: 'Signature cannot be verified, please ensure that you transaction have' + ' the correct prefix and the correct private key for the sender address',
    key: 'InvalidSignature',
    checkedKeys: ['encodedTx', 'signatures']
  }];
}, (_ref3, _ref4) => {
  let {
    encodedTx,
    tx
  } = _ref3;
  let {
    node,
    parentTxTypes,
    txType
  } = _ref4;
  if ((encodedTx !== null && encodedTx !== void 0 ? encodedTx : tx) === undefined) return [];
  return verifyTransaction(encode((encodedTx !== null && encodedTx !== void 0 ? encodedTx : tx).rlpEncoded, 'tx'), node, [...parentTxTypes, txType]);
}, (tx, _ref5) => {
  let {
    txType
  } = _ref5;
  if (tx.fee === undefined) return [];
  const minFee = calculateFee(0, txType, {
    gas: +tx.gas || 0,
    params: tx,
    showWarning: false,
    vsn: tx.VSN
  });
  if (new BigNumber(minFee).lte(tx.fee)) return [];
  return [{
    message: `Fee ${tx.fee} is too low, minimum fee for this transaction is ${minFee}`,
    key: 'InsufficientFee',
    checkedKeys: ['fee']
  }];
}, (_ref6, _ref7) => {
  let {
    ttl
  } = _ref6;
  let {
    height
  } = _ref7;
  if (ttl === undefined) return [];
  ttl = +ttl;
  if (ttl === 0 || ttl >= height) return [];
  return [{
    message: `TTL ${ttl} is already expired, current height is ${height}`,
    key: 'ExpiredTTL',
    checkedKeys: ['ttl']
  }];
}, (_ref8, _ref9) => {
  var _ref10;

  let {
    amount,
    fee,
    nameFee,
    tx
  } = _ref8;
  let {
    account,
    parentTxTypes,
    txType
  } = _ref9;
  if (((_ref10 = amount !== null && amount !== void 0 ? amount : fee) !== null && _ref10 !== void 0 ? _ref10 : nameFee) === undefined) return [];
  const cost = new BigNumber(fee).plus(nameFee || 0).plus(amount || 0).plus(txType === TX_TYPE.payingFor ? tx.tx.encodedTx.tx.fee : 0).minus(parentTxTypes.includes(TX_TYPE.payingFor) ? fee : 0);
  if (cost.lte(account.balance)) return [];
  return [{
    message: `Account balance ${account.balance} is not enough to execute the transaction that costs ${cost.toFixed()}`,
    key: 'InsufficientBalance',
    checkedKeys: ['amount', 'fee', 'nameFee']
  }];
}, (_ref11, _ref12) => {
  let {
    nonce
  } = _ref11;
  let {
    account,
    parentTxTypes
  } = _ref12;
  if (nonce === undefined || parentTxTypes.includes(TX_TYPE.gaMeta)) return [];
  nonce = +nonce;
  const validNonce = account.nonce + 1;
  if (nonce === validNonce) return [];
  return [{ ...(nonce < validNonce ? {
      message: `Nonce ${nonce} is already used, valid nonce is ${validNonce}`,
      key: 'NonceAlreadyUsed'
    } : {
      message: `Nonce ${nonce} is too high, valid nonce is ${validNonce}`,
      key: 'NonceHigh'
    }),
    checkedKeys: ['nonce']
  }];
}, _ref13 => {
  let {
    gasPrice
  } = _ref13;
  if (gasPrice === undefined) return [];
  if (gasPrice >= MIN_GAS_PRICE) return [];
  return [{
    message: `Gas price ${gasPrice} must be bigger then ${MIN_GAS_PRICE}`,
    key: 'MinGasPrice',
    checkedKeys: ['gasPrice']
  }];
}, (_ref14, _ref15) => {
  let {
    ctVersion,
    abiVersion
  } = _ref14;
  let {
    txType,
    node
  } = _ref15;
  const {
    consensusProtocolVersion
  } = node.getNodeInfo();
  const protocol = PROTOCOL_VM_ABI[consensusProtocolVersion];
  if (!protocol) throw new UnsupportedProtocolError(`Unsupported protocol: ${consensusProtocolVersion}`); // If not contract create tx

  if (!ctVersion) ctVersion = {
    abiVersion
  };
  const txProtocol = protocol[txType];
  if (!txProtocol) return [];

  if (Object.entries(ctVersion).some(_ref16 => {
    let [key, value] = _ref16;
    return !txProtocol[key].includes(+value);
  })) {
    return [{
      message: `ABI/VM version ${JSON.stringify(ctVersion)} is wrong, supported is: ${JSON.stringify(txProtocol)}`,
      key: 'VmAndAbiVersionMismatch',
      checkedKeys: ['ctVersion', 'abiVersion']
    }];
  }

  return [];
}, async (_ref17, _ref18) => {
  let {
    contractId
  } = _ref17;
  let {
    txType,
    node
  } = _ref18;
  if (TX_TYPE.contractCall !== txType) return [];

  try {
    const {
      active
    } = await node.api.getContract(contractId);
    if (active) return [];
    return [{
      message: `Contract ${contractId} is not active`,
      key: 'ContractNotActive',
      checkedKeys: ['contractId']
    }];
  } catch (error) {
    var _error$response, _error$response$body;

    if (!((_error$response = error.response) !== null && _error$response !== void 0 && (_error$response$body = _error$response.body) !== null && _error$response$body !== void 0 && _error$response$body.reason)) throw error;
    return [{
      message: error.response.body.reason,
      key: 'ContractNotFound',
      checkedKeys: ['contractId']
    }];
  }
}];

const getSenderAddress = tx => ['senderId', 'accountId', 'ownerId', 'callerId', 'oracleId', 'fromId', 'initiator', 'gaId', 'payerId'].map(key => tx[key]).filter(a => a).map(a => a.replace(/^ok_/, 'ak_'))[0];
/**
 * Transaction Validator
 * This function validates some of transaction properties,
 * to make sure it can be posted it to the chain
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/validator
 * @rtype (tx: String, node) => void
 * @param {String} transaction Base64Check-encoded transaction
 * @param {Object} node Node to validate transaction against
 * @param {String[]} [parentTxTypes] Types of parent transactions
 * @return {Promise<Object[]>} Array with verification errors
 * @example const errors = await verifyTransaction(transaction, node)
 */


export default async function verifyTransaction(transaction, node) {
  var _getSenderAddress;

  let parentTxTypes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  const {
    tx,
    txType
  } = unpackTx(transaction);
  const address = (_getSenderAddress = getSenderAddress(tx)) !== null && _getSenderAddress !== void 0 ? _getSenderAddress : txType === TX_TYPE.signed ? getSenderAddress(tx.encodedTx.tx) : null;
  const [account, {
    height
  }] = await Promise.all([address && node.api.getAccountByPubkey(address).catch(() => ({
    id: address,
    balance: new BigNumber(0),
    nonce: 0
  })), node.api.getCurrentKeyBlockHeight()]);
  return (await Promise.all(validators.map(v => v(tx, {
    txType,
    node,
    account,
    height,
    parentTxTypes
  })))).flat();
}
//# sourceMappingURL=validator.mjs.map