/**
 * Amount Formatter
 * @module @aeternity/aepp-sdk/es/utils/amount-formatter
 * @example import { AmountFormatter } from '@aeternity/aepp-sdk'
 */
import BigNumber from 'bignumber.js';
/**
 * AE amount formats
 */
export declare const AE_AMOUNT_FORMATS: {
    AE: string;
    MILI_AE: string;
    MICRO_AE: string;
    NANO_AE: string;
    PICO_AE: string;
    FEMTO_AE: string;
    AETTOS: string;
};
/**
 * DENOMINATION_MAGNITUDE
 */
export declare const DENOMINATION_MAGNITUDE: {
    [x: string]: number;
};
/**
 * Convert amount to AE
 * @param {String|Number|BigNumber} value amount to convert
 * @param {Object} [options={}] options
 * @param {String} [options.denomination='aettos'] denomination of amount, can be ['ae', 'aettos']
 * @return {String}
 */
export declare const toAe: (value: string | number | BigNumber, { denomination }?: {
    denomination?: string | undefined;
}) => string;
/**
 * Convert amount to aettos
 * @param {String|Number|BigNumber} value amount to convert
 * @param {Object} [options={}] options
 * @param {String} [options.denomination='ae'] denomination of amount, can be ['ae', 'aettos']
 * @return {String}
 */
export declare const toAettos: (value: string | number | BigNumber, { denomination }?: {
    denomination?: string | undefined;
}) => string;
/**
 * Convert amount from one to other denomination
 * @param {String|Number|BigNumber} value amount to convert
 * @param {Object} [options={}] options
 * @param {String} [options.denomination='aettos'] denomination of amount, can be ['ae', 'aettos']
 * @param {String} [options.targetDenomination='aettos'] target denomination, can be ['ae', 'aettos']
 * @return {String}
 */
export declare const formatAmount: (value: string | number | BigNumber, { denomination, targetDenomination }?: {
    denomination?: string | undefined;
    targetDenomination?: string | undefined;
}) => string;
declare const _default: (rawValue: string | number | BigNumber) => string;
export default _default;
