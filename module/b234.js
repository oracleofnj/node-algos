'use strict';

function B234Node(key, val, leftChild, rightChild) {
  return {
    keyEntries: [key],
    valEntries: [val],
    children: [((typeof leftChild === 'undefined') ? null : leftChild), ((typeof rightChild === 'undefined') ? null : rightChild)],
    degree: 2,
  };
}

function findKey(node, key) {
  let res = {found: false};
  switch(node.degree) {
    case 2:
      if (key === node.keyEntries[0]) {
        res.found = true;
        res.pos = 0;
      } else if (key < node.keyEntries[0]) {
        res.pos = 0;
      } else if (key > node.keyEntries[0]) {
        res.pos = 1;
      } else {
        throw new Error('key (' + key + ') not < === or > entry[0] (' + node.keyEntries[0] + ')');
      }
      break;
    case 3:
      if (key === node.keyEntries[1]) {
        res.found = true;
        res.pos = 1;
      } else if (key < node.keyEntries[1]) {
        if (key === node.keyEntries[0]) {
          res.found = true;
          res.pos = 0;
        } else if (key < node.keyEntries[0]) {
          res.pos = 0;
        } else if (key > node.keyEntries[0]) {
          res.pos = 1;
        } else {
          throw new Error('key not < === or > entry[0]');
        }
      } else if (key > node.keyEntries[1]) {
        res.pos = 2;
      } else {
        throw new Error('key not < === or > entry[1]')
      }
      break;
    case 4:
      if (key === node.keyEntries[1]) {
        res.found = true;
        res.pos = 1;
      } else if (key < node.keyEntries[1]) {
        if (key === node.keyEntries[0]) {
          res.found = true;
          res.pos = 0;
        } else if (key < node.keyEntries[0]) {
          res.pos = 0;
        } else if (key > node.keyEntries[0]) {
          res.pos = 1;
        } else {
          throw new Error('key not < === or > entry[0]');
        }
      } else if (key > node.keyEntries[1]) {
        if (key === node.keyEntries[2]) {
          res.found = true;
          res.pos = 2;
        } else if (key < node.keyEntries[2]) {
          res.pos = 2;
        } else if (key > node.keyEntries[2]) {
          res.pos = 3;
        } else {
          throw new Error('key not < === or > entry[2]');
        }
      } else {
        throw new Error('key not < === or > entry[1]')
      }
      break;
    default:
      throw new Error('Illegal degree ' + node.degree);
      break;
  }
  if (res.found) {
    res.val = node.valEntries[res.pos];
  }
  return res;
}

function mergeEntry(node, key, val, leftChild, rightChild) {
  if (typeof leftChild === 'undefined') {
    leftChild = null;
  }
  if (typeof rightChild === 'undefined') {
    rightChild = null;
  }
  if (node.degree >= 4) {
    throw new Error('Degree already ' + node.degree);
  }
  let keyloc = findKey(node, key);
  if (keyloc.found) {
    throw new Error('key already in node');
  }
  return {
    keyEntries: [...node.keyEntries.slice(0, keyloc.pos), key, ...node.keyEntries.slice(keyloc.pos)],
    valEntries: [...node.valEntries.slice(0, keyloc.pos), val, ...node.valEntries.slice(keyloc.pos)],
    children: [...node.children.slice(0, keyloc.pos), leftChild, rightChild, ...node.children.slice(keyloc.pos + 1)],
    degree: node.degree + 1,
  }
}

function splitNode(parent, node) {
  if (node.degree < 4) {
    return parent;
  }
  let leftChild = B234Node(node.keyEntries[0], node.valEntries[0], node.children[0], node.children[1]);
  let rightChild = B234Node(node.keyEntries[2], node.valEntries[2], node.children[2], node.children[3]);
  if (parent === null) {
    return B234Node(node.keyEntries[1], node.valEntries[1], leftChild, rightChild);
  } else {
    if (parent.degree === 4) {
      throw new Error('Asked to split into a parent of degree 4');
    }
    return mergeEntry(parent, node.keyEntries[1], node.valEntries[1], leftChild, rightChild);
  }
}

function insertIntoNonFullNode(node, key, val) {
  let keyloc = findKey(node, key);
  if (keyloc.found) {
    return {
      keyEntries: node.keyEntries.slice(0),
      valEntries: [...node.valEntries.slice(0, keyloc.pos), val, ...node.valEntries.slice(keyloc.pos + 1)],
      children: node.children.slice(0),
      degree: node.degree,
    }
  } else if (node.children[keyloc.pos] === null) { // should only happen at the leaf node
    return mergeEntry(node, key, val);
  } else {
    let res = splitNode(node, node.children[keyloc.pos]);
    keyloc = findKey(res, key);
    return {
      keyEntries: res.keyEntries,
      valEntries: res.valEntries,
      children: [...res.children.slice(0, keyloc.pos), insertIntoNonFullNode(res.children[keyloc.pos], key, val), ...res.children.slice(keyloc.pos + 1)],
      degree: res.degree,
    }
  }
}

class B234Tree {
  constructor() {
    this.root = null;
    this.keyType = null;
  }

  get(key) {
    if (this.keyType !== typeof key) {
      throw new Error('key type (' + typeof key + ') doesn\'t match tree key type (' + this.keyType + ')');
    }
    let node = this.root, keyloc;
    while (node !== null) {
      keyloc = findKey(node, key);
      if (keyloc.found) {
        return keyloc.val;
      }
      node = node.children[keyloc.pos];
    }
    return undefined;
  }

  put(key, val) {
    if (this.root === null) {
      this.keyType = typeof key;
      this.root = B234Node(key, val);
    } else {
      if (this.root.degree === 4) {
        this.root = splitNode(null, this.root);
      }
      this.root = insertIntoNonFullNode(this.root, key, val);
    }
  }

  contents() {
    return BinaryTree.inorder(this.root);
  }

  toString() {
    return JSON.stringify(this.root,null,2);
  }
}

module.exports = {B234Tree, findKey, B234Node, mergeEntry};
