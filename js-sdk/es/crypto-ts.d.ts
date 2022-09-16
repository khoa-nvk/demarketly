/// <reference types="node" />
import type { Data } from 'blakejs';
/**
 * Calculate 256bits Blake2b hash of `input`
 * @rtype (input: String) => hash: String
 * @param {Data} input - Data to hash
 * @return {Buffer} Hash
 */
export declare function hash(input: Data): Buffer;
