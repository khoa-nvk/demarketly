import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;

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

/**
 * Memory Account module
 * @module @aeternity/aepp-sdk/es/account/memory
 * @export MemoryAccount
 * @example import { MemoryAccount } from '@aeternity/aepp-sdk'
 */
import AccountBase from "./base.mjs";
import { sign, isValidKeypair } from "../utils/crypto.mjs";
import { isHex } from "../utils/string.mjs";
import { decode } from "../tx/builder/helpers.mjs";
import { InvalidKeypairError } from "../utils/errors.mjs";
const secrets = new WeakMap();
/**
 * In-memory account stamp
 * @function
 * @alias module:@aeternity/aepp-sdk/es/account/memory
 * @rtype Stamp
 * @param {Object} [options={}] - Initializer object
 * @param {Object} options.keypair - Key pair to use
 * @param {String} options.keypair.publicKey - Public key
 * @param {String} options.keypair.secretKey - Private key
 * @return {Account}
 */

export default AccountBase.compose({
  init(_ref) {
    let {
      keypair,
      gaId
    } = _ref;
    this.isGa = !!gaId;

    if (gaId) {
      decode(gaId);
      secrets.set(this, {
        publicKey: gaId
      });
      return;
    }

    if (!keypair || typeof keypair !== 'object') throw new InvalidKeypairError('KeyPair must be an object');

    if (!keypair.secretKey || !keypair.publicKey) {
      throw new InvalidKeypairError('KeyPair must must have "secretKey", "publicKey" properties');
    }

    if (typeof keypair.publicKey !== 'string' || keypair.publicKey.indexOf('ak_') === -1) {
      throw new InvalidKeypairError('Public Key must be a base58c string with "ak_" prefix');
    }

    if (!_Buffer.isBuffer(keypair.secretKey) && typeof keypair.secretKey === 'string' && !isHex(keypair.secretKey)) throw new InvalidKeypairError('Secret key must be hex string or Buffer');

    const pubBuffer = _Buffer.from(decode(keypair.publicKey, 'ak'));

    if (!isValidKeypair(_Buffer.from(keypair.secretKey, 'hex'), pubBuffer)) throw new InvalidKeypairError('Invalid Key Pair');
    secrets.set(this, {
      secretKey: _Buffer.isBuffer(keypair.secretKey) ? keypair.secretKey : _Buffer.from(keypair.secretKey, 'hex'),
      publicKey: keypair.publicKey
    });
  },

  props: {
    isGa: false
  },
  methods: {
    sign(data) {
      if (this.isGa) throw new InvalidKeypairError('You are trying to sign data using generalized account without keypair');
      return Promise.resolve(sign(data, secrets.get(this).secretKey));
    },

    address() {
      return Promise.resolve(secrets.get(this).publicKey);
    }

  }
});
//# sourceMappingURL=memory.mjs.map