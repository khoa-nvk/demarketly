import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;

/*
 * ISC License (ISC)
 * Copyright (c) 2021 aeternity developers
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
import _rlp from 'rlp';
const {
  encode: rlpEncode
} = _rlp;
import { hash } from "./crypto-ts.mjs";
import { MerkleTreeHashMismatchError, MissingNodeInTreeError, UnknownPathNibbleError, UnknownNodeLengthError } from "./errors.mjs";
var NodeType;

(function (NodeType) {
  NodeType[NodeType["Branch"] = 0] = "Branch";
  NodeType[NodeType["Extension"] = 1] = "Extension";
  NodeType[NodeType["Leaf"] = 2] = "Leaf";
})(NodeType || (NodeType = {}));

export default class MPTree {
  static nodeHash(node) {
    return _Buffer.from(hash(rlpEncode(node))).toString('hex');
  }
  /**
   * Deserialize Merkle Patricia Tree
   * @rtype (binary: Array) => MPTree
   * @param {Array} binary - Binary
   * @return {MPTree} Merkle Patricia Tree
   */


  constructor(binary) {
    this.rootHash = binary[0].toString('hex');
    this.nodes = Object.fromEntries(binary[1].map(node => [node[0].toString('hex'), node[1]]));
    if (this.nodes[this.rootHash] === undefined) throw new MissingNodeInTreeError('Can\'t find a node by root hash');
    Object.entries(this.nodes).forEach(_ref => {
      let [key, node] = _ref;
      if (MPTree.nodeHash(node) !== key) throw new MerkleTreeHashMismatchError();
      const {
        type,
        payload
      } = MPTree.parseNode(node);

      switch (type) {
        case NodeType.Branch:
          payload.slice(0, 16).filter(n => n.length).forEach(n => {
            if (this.nodes[n.toString('hex')] === undefined) {
              throw new MissingNodeInTreeError('Can\'t find a node by hash in branch node');
            }
          });
          break;

        case NodeType.Extension:
          if (this.nodes[payload[0].toString('hex')] === undefined) {
            throw new MissingNodeInTreeError('Can\'t find a node by hash in extension node');
          }

      }
    });
  }

  isEqual(tree) {
    return this.rootHash === tree.rootHash;
  }

  static parseNode(node) {
    switch (node.length) {
      case 17:
        return {
          type: NodeType.Branch,
          payload: node,
          path: null
        };

      case 2:
        {
          const path = node[0].toString('hex');
          const nibble = parseInt(path[0], 16);
          if (nibble > 3) throw new UnknownPathNibbleError(nibble);
          const type = nibble <= 1 ? NodeType.Extension : NodeType.Leaf;
          const slice = [0, 2].includes(nibble) ? 2 : 1;
          return {
            type,
            payload: [node[1]],
            path: path.slice(slice)
          };
        }

      default:
        throw new UnknownNodeLengthError(node.length);
    }
  }
  /**
   * Serialize Merkle Patricia Tree
   * @rtype () => Array
   * @return {Array} Binary
   */


  serialize() {
    return [_Buffer.from(this.rootHash, 'hex'), Object.entries(this.nodes).map(_ref2 => {
      let [mptHash, value] = _ref2;
      return [_Buffer.from(mptHash, 'hex'), value];
    })];
  }
  /**
   * Retrieve value from Merkle Patricia Tree
   * @rtype (key: String) => Buffer
   * @param {String} key - The key of the element to retrieve
   * @return {Buffer} Value associated to the specified key
   */


  get(key) {
    let searchFrom = this.rootHash;

    while (true) {
      const {
        type,
        payload,
        path
      } = MPTree.parseNode(this.nodes[searchFrom]);

      switch (type) {
        case NodeType.Branch:
          if (key.length === 0) return payload[16];
          searchFrom = payload[parseInt(key[0], 16)].toString('hex');
          key = key.substr(1);
          break;

        case NodeType.Extension:
          if (key.substr(0, path === null || path === void 0 ? void 0 : path.length) !== path) return undefined;
          searchFrom = payload[0].toString('hex');
          key = key.substr(path.length);
          break;

        case NodeType.Leaf:
          if (path !== key) return undefined;
          return payload[0];
      }
    }
  }

}
//# sourceMappingURL=mptree.mjs.map