/**
 * Big Number Helpers
 * @module @aeternity/aepp-sdk/es/utils/bignumber
 * @example import { isBigNumber, ceil } from '@aeternity/aepp-sdk/es/utils/bignumber'
 */
import BigNumber from 'bignumber.js';
/**
 * Check if value is BigNumber, Number or number string representation
 * @param {String|Number|BigNumber} number number to convert
 * @return {Boolean}
 */
export declare const isBigNumber: (number: string | number | BigNumber) => boolean;
/**
 * BigNumber ceil operation
 * @param {BigNumber} bigNumber
 * @return {BigNumber}
 */
export declare const ceil: (bigNumber: BigNumber) => BigNumber;
