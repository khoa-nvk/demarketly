import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;

/*
 * ISC License (ISC)
 * Copyright 2018 aeternity developers
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

/**
 * Crypto module
 * @module @aeternity/aepp-sdk/es/utils/crypto
 * @example import { Crypto } from '@aeternity/aepp-sdk'
 */
import nacl from 'tweetnacl';
import aesjs from 'aes-js';
import { str2buf } from "./bytes.mjs";
import { encode, decode, sha256hash } from "./encoder.mjs";
import { hash } from "./crypto-ts.mjs";
import { NotImplementedError } from "./errors.mjs";
export * from "./crypto-ts.mjs";
export { sha256hash };
const Ecb = aesjs.ModeOfOperation.ecb;
/**
 * Generate address from secret key
 * @rtype (secret: String) => tx: Promise[String]
 * @param {String} secret - Private key
 * @return {String} Public key
 */

export function getAddressFromPriv(secret) {
  const keys = nacl.sign.keyPair.fromSecretKey(str2buf(secret));

  const publicBuffer = _Buffer.from(keys.publicKey);

  return encode(publicBuffer, 'ak');
}
/**
 * Check if address is valid
 * @rtype (input: String) => valid: Boolean
 * @param {String} address - Address
 * @param {String} prefix Transaction prefix. Default: 'ak'
 * @return {Boolean} valid
 */

export function isAddressValid(address) {
  let prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ak';

  try {
    decode(address, prefix);
    return true;
  } catch (e) {
    return false;
  }
}
/**
 * Generate a random salt (positive integer)
 * @rtype () => salt: Number
 * @return {Number} random salt
 */

export function salt() {
  return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}
/**
 * Converts a positive integer to the smallest possible
 * representation in a binary digit representation
 * @rtype (value: Number) => Buffer
 * @param {Number} value - Value to encode
 * @return {Buffer} - Encoded data
 */

export function encodeUnsigned(value) {
  const binary = _Buffer.allocUnsafe(4);

  binary.writeUInt32BE(value);
  return binary.slice(binary.findIndex(i => i !== 0));
} // Todo Duplicated in tx builder. remove

/**
 * Compute contract address
 * @rtype (owner: String, nonce: Number) => String
 * @param {String} owner - Address of contract owner
 * @param {Number} nonce - Round when contract was created
 * @return {String} - Contract address
 */

export function encodeContractAddress(owner, nonce) {
  const publicKey = decode(owner, 'ak');

  const binary = _Buffer.concat([publicKey, encodeUnsigned(nonce)]);

  return encode(hash(binary), 'ct');
} // KEY-PAIR HELPERS

/**
 * Generate keyPair from secret key
 * @rtype (secret: Uint8Array) => KeyPair
 * @param {Uint8Array} secret - secret key
 * @return {Object} - Object with Private(privateKey) and Public(publicKey) keys
 */

export function generateKeyPairFromSecret(secret) {
  return nacl.sign.keyPair.fromSecretKey(secret);
}
/**
 * Generate a random ED25519 keypair
 * @rtype (raw: Boolean) => {publicKey: String | Buffer, secretKey: String | Buffer}
 * @param {Boolean} raw - Whether to return raw (binary) keys
 * @return {Object} Key pair
 */

export function generateKeyPair() {
  let raw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  // <node>/apps/aens/test/aens_test_utils.erl
  const keyPair = nacl.sign.keyPair();

  const publicBuffer = _Buffer.from(keyPair.publicKey);

  const secretBuffer = _Buffer.from(keyPair.secretKey);

  if (raw) {
    return {
      publicKey: publicBuffer,
      secretKey: secretBuffer
    };
  } else {
    return {
      publicKey: encode(publicBuffer, 'ak'),
      secretKey: secretBuffer.toString('hex')
    };
  }
}
/**
 * Encrypt given data using `password`
 * @rtype (password: String, binaryData: Buffer) => Uint8Array
 * @param {String} password - Password to encrypt with
 * @param {Buffer} binaryData - Data to encrypt
 * @return {Uint8Array} Encrypted data
 */

export function encryptKey(password, binaryData) {
  const hashedPasswordBytes = sha256hash(password);
  const aesEcb = new Ecb(hashedPasswordBytes);
  return aesEcb.encrypt(binaryData);
}
/**
 * Decrypt given data using `password`
 * @rtype (password: String, encrypted: String) => Uint8Array
 * @param {String} password - Password to decrypt with
 * @param {String} encrypted - Data to decrypt
 * @return {Buffer} Decrypted data
 */

export function decryptKey(password, encrypted) {
  const encryptedBytes = _Buffer.from(encrypted);

  const hashedPasswordBytes = sha256hash(password);
  const aesEcb = new Ecb(hashedPasswordBytes);
  return _Buffer.from(aesEcb.decrypt(encryptedBytes));
} // SIGNATURES

/**
 * Generate signature
 * @rtype (data: String|Buffer, privateKey: Buffer) => Buffer
 * @param {String|Buffer} data - Data to sign
 * @param {String|Buffer} privateKey - Key to sign with
 * @return {Buffer|Uint8Array} Signature
 */

export function sign(data, privateKey) {
  return nacl.sign.detached(_Buffer.from(data), _Buffer.from(privateKey));
}
/**
 * Verify that signature was signed by public key
 * @rtype (str: String, signature: Buffer, publicKey: Buffer) => Boolean
 * @param {String|Buffer} str - Data to verify
 * @param {Buffer} signature - Signature to verify
 * @param {Buffer} publicKey - Key to verify against
 * @return {Boolean} Valid?
 */

export function verify(str, signature, publicKey) {
  return nacl.sign.detached.verify(new Uint8Array(str), signature, publicKey);
}
export function messageToHash(message) {
  const p = _Buffer.from('aeternity Signed Message:\n', 'utf8');

  const msg = _Buffer.from(message, 'utf8');

  if (msg.length >= 0xFD) throw new NotImplementedError('Message too long');
  return hash(_Buffer.concat([_Buffer.from([p.length]), p, _Buffer.from([msg.length]), msg]));
}
export function signMessage(message, privateKey) {
  return sign(messageToHash(message), privateKey);
}
export function verifyMessage(str, signature, publicKey) {
  return verify(messageToHash(str), signature, publicKey);
}
/**
 * Check key pair for validity
 *
 * Sign a message, and then verifying that signature
 * @rtype (privateKey: Buffer, publicKey: Buffer) => Boolean
 * @param {Buffer} privateKey - Private key to verify
 * @param {Buffer} publicKey - Public key to verify
 * @return {Boolean} Valid?
 */

export function isValidKeypair(privateKey, publicKey) {
  const message = _Buffer.from('TheMessage');

  const signature = sign(message, privateKey);
  return verify(message, signature, publicKey);
}
//# sourceMappingURL=crypto.mjs.map