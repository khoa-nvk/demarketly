/// <reference types="node" />
export declare type MPTreeBinary = [Buffer, Array<[Buffer, Buffer[]]>];
export default class MPTree {
    private readonly rootHash;
    private readonly nodes;
    private static nodeHash;
    /**
     * Deserialize Merkle Patricia Tree
     * @rtype (binary: Array) => MPTree
     * @param {Array} binary - Binary
     * @return {MPTree} Merkle Patricia Tree
     */
    constructor(binary: MPTreeBinary);
    isEqual(tree: MPTree): boolean;
    private static parseNode;
    /**
     * Serialize Merkle Patricia Tree
     * @rtype () => Array
     * @return {Array} Binary
     */
    serialize(): MPTreeBinary;
    /**
     * Retrieve value from Merkle Patricia Tree
     * @rtype (key: String) => Buffer
     * @param {String} key - The key of the element to retrieve
     * @return {Buffer} Value associated to the specified key
     */
    get(key: string): Buffer | undefined;
}
