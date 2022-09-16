export declare const pause: (duration: number) => Promise<void>;
export declare const mapObject: (object: object, fn: (value: [string, any], index: number, array: Array<[string, any]>) => Array<[string, any]>) => object;
export declare const filterObject: (object: object, fn: (value: [string, any], index: number, array: Array<[string, any]>) => boolean) => object;
/**
 * Key traversal metafunction
 * @static
 * @function
 * @rtype (fn: (s: String) => String) => (o: Object) => Object
 * @param {Function} fn - Key transformation function
 * @param {Object} object - Object to traverse
 * @return {Object} Transformed object
 */
export declare const traverseKeys: (fn: Function, object: any) => any;
/**
 * snake_case key traversal
 * @static
 * @rtype (o: Object) => Object
 * @param {Object} object - Object to traverse
 * @return {Object} Transformed object
 * @see pascalToSnake
 */
export declare const snakizeKeys: any;
/**
 * PascalCase key traversal
 * @static
 * @rtype (o: Object) => Object
 * @param {Object} object - Object to traverse
 * @return {Object} Transformed object
 * @see snakeToPascal
 */
export declare const pascalizeKeys: any;
