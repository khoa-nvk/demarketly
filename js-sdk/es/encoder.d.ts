/// <reference types="node" />
/**
 * Calculate SHA256 hash of `input`
 * @rtype (input: String) => hash: String
 * @param {Buffer|String} input - Data to hash
 * @return {String} Hash
 */
export declare function sha256hash(input: Buffer | string): Buffer;
/**
 * Decode data using the default encoding/decoding algorithm
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder/helpers
 * @param {string} data An Base58/64check encoded and prefixed string (ex tx_..., sg_..., ak_....)
 * @param {string} [requiredPrefix] Ensure that data have this prefix
 * @return {Buffer} Decoded data
 */
export declare function decode(data: string, requiredPrefix?: string): Buffer;
/**
 * Encode data using the default encoding/decoding algorithm
 * @function
 * @alias module:@aeternity/aepp-sdk/es/tx/builder/helpers
 * @param {Buffer|String} data  An decoded data
 * @param {string} type Prefix of Transaction
 * @return {String} Encoded string Base58check or Base64check data
 */
export declare function encode(data: Buffer | string, type: string): string;
