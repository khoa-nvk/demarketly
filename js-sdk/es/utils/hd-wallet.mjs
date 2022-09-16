import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;
import nacl from 'tweetnacl';
import _tweetnaclAuth from 'tweetnacl-auth';
const {
  full: hmac
} = _tweetnaclAuth;
import _bip32Path from 'bip32-path';
const {
  fromString
} = _bip32Path;
import { decryptKey, encryptKey } from "./crypto.mjs";
import { encode } from "../tx/builder/helpers.mjs";
import { InvalidDerivationPathError, NotHardenedSegmentError, UnsupportedChildIndexError } from "./errors.mjs";

const ED25519_CURVE = _Buffer.from('ed25519 seed');

const HARDENED_OFFSET = 0x80000000;

const toHex = buffer => _Buffer.from(buffer).toString('hex');

export function derivePathFromKey(path, key) {
  const segments = path === '' ? [] : fromString(path).toPathArray();
  segments.forEach((segment, i) => {
    if (segment < HARDENED_OFFSET) {
      throw new NotHardenedSegmentError(`Segment #${i + 1} is not hardened`);
    }
  });
  return segments.reduce((parentKey, segment) => deriveChild(parentKey, segment), key);
}
export function derivePathFromSeed(path, seed) {
  if (!['m', 'm/'].includes(path.slice(0, 2))) {
    throw new InvalidDerivationPathError();
  }

  const masterKey = getMasterKeyFromSeed(seed);
  return derivePathFromKey(path.slice(2), masterKey);
}

function formatAccount(keys) {
  const {
    secretKey,
    publicKey
  } = keys;
  return {
    secretKey: toHex(secretKey),
    publicKey: encode(publicKey, 'ak')
  };
}

export function getKeyPair(secretKey) {
  return nacl.sign.keyPair.fromSeed(secretKey);
}
export function getMasterKeyFromSeed(seed) {
  const I = hmac(seed, ED25519_CURVE);
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    secretKey: IL,
    chainCode: IR
  };
}
export function deriveChild(_ref, index) {
  let {
    secretKey,
    chainCode
  } = _ref;

  if (index < HARDENED_OFFSET) {
    throw new UnsupportedChildIndexError(index);
  }

  const indexBuffer = _Buffer.allocUnsafe(4);

  indexBuffer.writeUInt32BE(index, 0);

  const data = _Buffer.concat([_Buffer.alloc(1, 0), _Buffer.from(secretKey), _Buffer.from(indexBuffer)]);

  const I = hmac(data, chainCode);
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    secretKey: IL,
    chainCode: IR
  };
}
export function generateSaveHDWalletFromSeed(seed, password) {
  const walletKey = derivePathFromSeed('m/44h/457h', seed);
  return {
    secretKey: toHex(encryptKey(password, walletKey.secretKey)),
    chainCode: toHex(encryptKey(password, walletKey.chainCode))
  };
}
export function getSaveHDWalletAccounts(saveHDWallet, password, accountCount) {
  const walletKey = {
    secretKey: decryptKey(password, _Buffer.from(saveHDWallet.secretKey, 'hex')),
    chainCode: decryptKey(password, _Buffer.from(saveHDWallet.chainCode, 'hex'))
  };
  return new Array(accountCount).fill().map((_, idx) => formatAccount(getKeyPair(derivePathFromKey(`${idx}h/0h/0h`, walletKey).secretKey)));
}
export const getHdWalletAccountFromSeed = (seed, accountIdx) => {
  const walletKey = derivePathFromSeed('m/44h/457h', seed);
  const derived = derivePathFromKey(`${accountIdx}h/0h/0h`, walletKey);
  const keyPair = getKeyPair(derived.secretKey);
  return { ...formatAccount(keyPair),
    idx: accountIdx
  };
};
//# sourceMappingURL=hd-wallet.mjs.map