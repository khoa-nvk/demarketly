import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;
import nacl from 'tweetnacl';
import { v4 as uuid } from '@aeternity/uuid';
import _aeternityArgon2BrowserDistArgon2BundledMinJs from '@aeternity/argon2-browser/dist/argon2-bundled.min.js';
const {
  ArgonType,
  hash
} = _aeternityArgon2BrowserDistArgon2BundledMinJs;
import { encode } from "../tx/builder/helpers.mjs";
import { str2buf } from "./bytes.mjs";
import { ArgumentError, InvalidKeyError, UnsupportedAlgorithmError, InvalidPasswordError } from "./errors.mjs";
/**
 * KeyStore module
 * @module @aeternity/aepp-sdk/es/utils/keystore
 * @example import { Keystore } from '@aeternity/aepp-sdk'
 * @example const { Keystore } = require('@aeternity/aepp-sdk')
 */

const DEFAULTS = {
  crypto: {
    secret_type: 'ed25519',
    symmetric_alg: 'xsalsa20-poly1305',
    kdf: 'argon2id',
    kdf_params: {
      memlimit_kib: 65536,
      opslimit: 3,
      parallelism: 1
    }
  }
}; // DERIVED KEY PART

const DERIVED_KEY_FUNCTIONS = {
  argon2id: deriveKeyUsingArgon2id
};
export async function deriveKeyUsingArgon2id(pass, salt, options) {
  const {
    memlimit_kib: mem,
    opslimit: time
  } = options.kdf_params;
  const result = (await hash({
    hashLen: 32,
    pass,
    salt,
    time,
    mem,
    type: ArgonType.Argon2id
  })).hash;
  return _Buffer.from(result);
} // CRYPTO PART

const CRYPTO_FUNCTIONS = {
  'xsalsa20-poly1305': {
    encrypt: encryptXsalsa20Poly1305,
    decrypt: decryptXsalsa20Poly1305
  }
};

function encryptXsalsa20Poly1305(_ref) {
  let {
    plaintext,
    key,
    nonce
  } = _ref;
  return nacl.secretbox(plaintext, nonce, key);
}

function decryptXsalsa20Poly1305(_ref2) {
  let {
    ciphertext,
    key,
    nonce
  } = _ref2;
  const res = nacl.secretbox.open(ciphertext, nonce, key);
  if (!res) throw new InvalidPasswordError('Invalid password or nonce');
  return res;
}
/**
 * Symmetric private key encryption using secret (derived) key.
 * @param {Buffer|string} plaintext Data to be encrypted.
 * @param {Buffer|string} key Secret key.
 * @param {Buffer|string} nonce Randomly generated nonce.
 * @param {string=} algo Encryption algorithm (default: DEFAULTS.crypto.symmetric_alg).
 * @return {Buffer} Encrypted data.
 */


function encrypt(plaintext, key, nonce) {
  let algo = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULTS.crypto.symmetric_alg;
  if (!CRYPTO_FUNCTIONS[algo]) throw new UnsupportedAlgorithmError(algo);
  return CRYPTO_FUNCTIONS[algo].encrypt({
    plaintext,
    nonce,
    key
  });
}
/**
 * Symmetric private key decryption using secret (derived) key.
 * @param {Buffer|Uint8Array} ciphertext Data to be decrypted.
 * @param {Buffer|Uint8Array} key Secret key.
 * @param {Buffer|Uint8Array} nonce Nonce from key-object.
 * @param {string=} algo Encryption algorithm.
 * @return {Buffer} Decrypted data.
 */


function decrypt(ciphertext, key, nonce, algo) {
  if (!CRYPTO_FUNCTIONS[algo]) throw new UnsupportedAlgorithmError(algo);
  return CRYPTO_FUNCTIONS[algo].decrypt({
    ciphertext,
    nonce,
    key
  });
}
/**
 * Derive secret key from password with key derivation function.
 * @param {string} password User-supplied password.
 * @param {Buffer|Uint8Array} nonce Randomly generated nonce.
 * @param {Object=} options Encryption parameters.
 * @param {string=} options.kdf Key derivation function (default: DEFAULTS.crypto.kdf).
 * @param {Object=} options.kdf_params KDF parameters (default: DEFAULTS.crypto.kdf_params).
 * @return {Buffer} Secret key derived from password.
 */


async function deriveKey(password, nonce) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    kdf_params: DEFAULTS.crypto.kdf_params,
    kdf: DEFAULTS.crypto.kdf
  };
  if (!nonce) throw new ArgumentError('nonce', 'provided', nonce);
  if (password == null) throw new ArgumentError('password', 'provided', password);

  if (!Object.prototype.hasOwnProperty.call(DERIVED_KEY_FUNCTIONS, options.kdf)) {
    throw new UnsupportedAlgorithmError(options.kdf);
  }

  return DERIVED_KEY_FUNCTIONS[options.kdf](password, nonce, options);
}
/**
 * Assemble key data object in secret-storage format.
 * @param {Buffer} name Key name.
 * @param {Buffer} derivedKey Password-derived secret key.
 * @param {Buffer} privateKey Private key.
 * @param {Buffer} nonce Randomly generated 24byte nonce.
 * @param {Buffer} salt Randomly generated 16byte salt.
 * @param {Object=} options Encryption parameters.
 * @param {string=} options.kdf Key derivation function (default: argon2id).
 * @param {string=} options.cipher Symmetric cipher (default: constants.cipher).
 * @param {Object=} options.kdf_params KDF parameters (default: constants.<kdf>).
 * @return {Object}
 */


function marshal(name, derivedKey, privateKey, nonce, salt) {
  let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  const opt = Object.assign({}, DEFAULTS.crypto, options);
  return Object.assign({
    name,
    version: 1,
    public_key: getAddressFromPriv(privateKey),
    id: uuid()
  }, {
    crypto: Object.assign({
      secret_type: opt.secret_type,
      symmetric_alg: opt.symmetric_alg,
      ciphertext: _Buffer.from(encrypt(_Buffer.from(privateKey), derivedKey, nonce, opt.symmetric_alg)).toString('hex'),
      cipher_params: {
        nonce: _Buffer.from(nonce).toString('hex')
      }
    }, {
      kdf: opt.kdf,
      kdf_params: { ...opt.kdf_params,
        salt: _Buffer.from(salt).toString('hex')
      }
    })
  });
}

export function getAddressFromPriv(secret) {
  const keys = nacl.sign.keyPair.fromSecretKey(str2buf(secret));

  const publicBuffer = _Buffer.from(keys.publicKey);

  return encode(publicBuffer, 'ak');
}
/**
 * Recover plaintext private key from secret-storage key object.
 * @param {String} password Keystore object password.
 * @param {Object} keyObject Keystore object.
 * @return {Buffer} Plaintext private key.
 */

export async function recover(password, keyObject) {
  validateKeyObj(keyObject);
  const nonce = Uint8Array.from(str2buf(keyObject.crypto.cipher_params.nonce));
  const salt = Uint8Array.from(str2buf(keyObject.crypto.kdf_params.salt));
  const kdfParams = keyObject.crypto.kdf_params;
  const kdf = keyObject.crypto.kdf;
  const key = await decrypt(Uint8Array.from(str2buf(keyObject.crypto.ciphertext)), await deriveKey(password, salt, {
    kdf,
    kdf_params: kdfParams
  }), nonce, keyObject.crypto.symmetric_alg);
  if (!key) throw new InvalidPasswordError('Invalid password');
  if (_Buffer.from(key).length === 64) return _Buffer.from(key).toString('hex');
  return _Buffer.from(key).toString('utf-8');
}
/**
 * Export private key to keystore secret-storage format.
 * @param {String} name Key name.
 * @param {String} password User-supplied password.
 * @param {String|Buffer} privateKey Private key as hex-string or a Buffer.
 * @param {Buffer} nonce Randomly generated 24byte nonce.
 * @param {Buffer} salt Randomly generated 16byte salt.
 * @param {Object=} options Encryption parameters.
 * @param {String=} options.kdf Key derivation function (default: pbkdf2).
 * @param {String=} options.cipher Symmetric cipher (default: constants.cipher).
 * @param {Object=} options.kdfparams KDF parameters (default: constants.<kdf>).
 * @return {Object}
 */

export async function dump(name, password, privateKey) {
  let nonce = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : nacl.randomBytes(24);
  let salt = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : nacl.randomBytes(16);
  let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  const opt = Object.assign({}, DEFAULTS.crypto, options);
  return marshal(name, await deriveKey(password, salt, opt), typeof privateKey === 'string' ? _Buffer.from(privateKey, 'hex') : privateKey, nonce, salt, opt);
}
export function validateKeyObj(obj) {
  const root = ['crypto', 'id', 'version', 'public_key'];
  const cryptoKeys = ['cipher_params', 'ciphertext', 'symmetric_alg', 'kdf', 'kdf_params'];
  const missingRootKeys = root.filter(key => !Object.prototype.hasOwnProperty.call(obj, key));
  if (missingRootKeys.length) throw new InvalidKeyError(`Invalid key file format. Require properties: ${missingRootKeys}`);
  const missingCryptoKeys = cryptoKeys.filter(key => !Object.prototype.hasOwnProperty.call(obj.crypto, key));
  if (missingCryptoKeys.length) throw new InvalidKeyError(`Invalid key file format. Require properties: ${missingCryptoKeys}`);
  return true;
}
//# sourceMappingURL=keystore.mjs.map