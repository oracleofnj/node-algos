'use strict';

function TreeNode(key, val) {
  return {
    key: key,
    val: val,
    leftChild: null,
    rightChild: null,
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
    this.keyType = null;
  }

  get(key) {
    if (this.keyType !== typeof key) {
      throw new Error('key type (' + typeof key + ') doesn\'t match tree key type (' + this.keyType + ')');
    }
    let node = this.root;
    while (node !== null) {
      if (key === node.key) {
        return node.val;
      } else if (key < node.key) {
        node = node.leftChild;
      } else if (key > node.key) {
        node = node.rightChild;
      } else {
        throw new Error('key wasn\'t <, ===, or > than node.key'); // might be possible b/c of JS == vs ===
      }
    }
    return undefined;
  }

  static putInNode(key, val, node) {
    if (node === null) {
      return TreeNode(key, val);
    }
    if (key === node.key) {
      node.val = val;
    } else if (key < node.key) {
      node.leftChild = BinaryTree.putInNode(key, val, node.leftChild);
    } else if (key > node.key) {
      node.rightChild = BinaryTree.putInNode(key, val, node.rightChild);
    } else {
      throw new Error('key wasn\'t <, ===, or > than node.key'); // might be possible b/c of JS == vs ===
    }
    return node;
  }

  put(key, val) {
    if (this.root === null) {
      this.keyType = typeof key;
    }
    this.root = BinaryTree.putInNode(key, val, this.root);
  }

  static inorder(node) {
    if (node === null) {
      return [];
    } else {
      let kv = {};
      kv[node.key] = node.val;
      return [...BinaryTree.inorder(node.leftChild), kv, ...BinaryTree.inorder(node.rightChild)];
    }
  }

  contents() {
    return BinaryTree.inorder(this.root);
  }

  toString() {
    return JSON.stringify(this.root,null,2);
  }
}

module.exports = BinaryTree;
