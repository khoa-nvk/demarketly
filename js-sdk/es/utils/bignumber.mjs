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

export const isBigNumber = number => ['number', 'object', 'string', 'bigint'].includes(typeof number) && (!isNaN(number) || Number.isInteger(number) || BigNumber.isBigNumber(number));
/**
 * BigNumber ceil operation
 * @param {BigNumber} bigNumber
 * @return {BigNumber}
 */

export const ceil = bigNumber => bigNumber.integerValue(BigNumber.ROUND_CEIL);
//# sourceMappingURL=bignumber.mjs.map