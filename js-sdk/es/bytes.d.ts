/// <reference types="node" />
import BigNumber from 'bignumber.js';
/**
 * Bytes module
 * @module @aeternity/aepp-sdk/es/utils/bytes
 * @example import { Crypto } from '@aeternity/aepp-sdk'
 */
/**
 * Convert bignumber to byte array
 * @param {BigNumber} x bignumber instance
 * @return Buffer
 */
export declare function bigNumberToByteArray(x: BigNumber): Buffer;
/**
 * Convert string, number, or BigNumber to byte array
 * @param {null|string|number|BigNumber} val
 * @param {boolean} big enables force conversion to BigNumber
 * @return Buffer
 */
export declare function toBytes(val?: null | string | number | BigNumber, big?: boolean): Buffer;
/**
 * Convert a string to a Buffer.  If encoding is not specified, hex-encoding
 * will be used if the input is valid hex.  If the input is valid base64 but
 * not valid hex, base64 will be used.  Otherwise, utf8 will be used.
 * @param {string} str String to be converted.
 * @param {string} [enc] Encoding of the input string.
 * @return {buffer} Buffer containing the input data.
 */
export declare function str2buf(str: string, enc?: BufferEncoding): Buffer;
