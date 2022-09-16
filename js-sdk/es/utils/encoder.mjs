import _buffer from "buffer";
const {
    Buffer: _Buffer
} = _buffer;
import * as bs58 from 'bs58';

import _shaJs from '../sha.js/index';
const {
    sha256
} = _shaJs;
import { DecodeError, EncodeError, InvalidChecksumError, PayloadLengthError, PrefixMismatchError } from "./errors.mjs";
/**
 * Calculate SHA256 hash of `input`
 * @rtype (input: String) => hash: String
 * @param {Buffer|String} input - Data to hash
 * @return {String} Hash
 */

export function sha256hash(input) {
    let res = new sha256().update(input).digest();
    return res
} // based on https://github.com/aeternity/protocol/blob/master/node/api/api_encoding.md

const base64Types = ['ba', 'cb', 'or', 'ov', 'pi', 'ss', 'cs', 'ck', 'cv', 'st', 'tx'];
const base58Types = ['ak', 'bf', 'bs', 'bx', 'ch', 'cm', 'ct', 'kh', 'mh', 'nm', 'ok', 'oq', 'pp', 'sg', 'th']; // TODO: add all types with a fixed length

const typesLength = {
    ak: 32,
    ct: 32,
    ok: 32
};

function ensureValidLength(data, type) {
    if (!typesLength[type]) return;
    if (data.length === typesLength[type]) return;
    throw new PayloadLengthError(`Payload should be ${typesLength[type]} bytes, got ${data.length} instead`);
}

const getChecksum = payload => sha256hash(sha256hash(payload)).slice(0, 4);

const addChecksum = input => {
    const payload = _Buffer.from(input);
    let arr = [payload, getChecksum(payload)]
    return _Buffer.concat(arr);
};

function getPayload(buffer) {
    const payload = buffer.slice(0, -4);
    // let check = getChecksum(payload).equals(buffer.slice(-4))
    // if (!check) throw new InvalidChecksumError();
    return payload;
}

const base64 = {
    encode: buffer => addChecksum(buffer).toString('base64'),
    decode: string => getPayload(_Buffer.from(string, 'base64'))
};
const base58 = {
    encode: buffer => bs58.encode(addChecksum(buffer)),
    decode: string => getPayload(bs58.decode(string))
};
/**
 * Decode data using the default encoding/decoding algorithm
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder/helpers
 * @param {string} data An Base58/64check encoded and prefixed string (ex tx_..., sg_..., ak_....)
 * @param {string} [requiredPrefix] Ensure that data have this prefix
 * @return {Buffer} Decoded data
 */

export function decode(data, requiredPrefix) {
    const [prefix, encodedPayload, extra] = data.split('_');
    if (!encodedPayload) throw new DecodeError(`Encoded string missing payload: ${data}`);
    if (extra) throw new DecodeError(`Encoded string have extra parts: ${data}`);

    if (requiredPrefix && requiredPrefix !== prefix) {
        throw new PrefixMismatchError(prefix, requiredPrefix);
    }

    const decoder = base64Types.includes(prefix) && base64.decode || base58Types.includes(prefix) && base58.decode;
    if (!decoder) {
        throw new DecodeError(`Encoded string have unknown type: ${prefix}`);
    }

    const payload = decoder(encodedPayload);
    ensureValidLength(payload, prefix);
    return payload;
}
/**
 * Encode data using the default encoding/decoding algorithm
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder/helpers
 * @param {Buffer|String} data  An decoded data
 * @param {string} type Prefix of Transaction
 * @return {String} Encoded string Base58check or Base64check data
 */

export function encode(data, type) {
    const encoder = base64Types.includes(type) && base64.encode || base58Types.includes(type) && base58.encode;

    if (!encoder) {
        throw new EncodeError(`Unknown type: ${type}`);
    }

    ensureValidLength(data, type);
    return `${type}_${encoder(data)}`;
}
//# sourceMappingURL=encoder.mjs.map