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

function adjustForDelete(node, pos) {
  if (node.degree <= 2) {
    throw new Error('Asked to adjust a singleton node for deletion');
  }
  if (node.children[pos].degree > 2) {
    return node;
  }
  if ((pos > 0) && (node.children[pos - 1].degree > 2)) {
    // left sibling has an extra node available: rotate right
    return {
      keyEntries: [...node.keyEntries.slice(0, pos - 1), node.children[pos - 1].keyEntries[node.children[pos - 1].degree - 2], ...node.keyEntries.slice(pos - 1)],
      valEntries: [...node.valEntries.slice(0, pos - 1), node.children[pos - 1].valEntries[node.children[pos - 1].degree - 2], ...node.valEntries.slice(pos - 1)],
//      children: [...node.keyEntries.slice(0, pos - 1), node.children[pos - 1].keyEntries[node.children[pos - 1].degree - 2], ...node.keyEntries.slice(pos - 1)],
      degree: node.degree,
    };
  } else if ((pos < (node.degree - 1)) && (node.children[pos + 1].degree > 2)) {
    // right sibling has an extra node available: rotate left
    return {
      keyEntries: [...node.keyEntries.slice(0, pos - 1), node.children[pos - 1].keyEntries[node.children[pos - 1].degree - 2], ...node.keyEntries.slice(pos - 1)],
      valEntries: [...node.valEntries.slice(0, pos - 1), node.children[pos - 1].valEntries[node.children[pos - 1].degree - 2], ...node.valEntries.slice(pos - 1)],
//      children: [...node.keyEntries.slice(0, pos - 1), node.children[pos - 1].keyEntries[node.children[pos - 1].degree - 2], ...node.keyEntries.slice(pos - 1)],
      degree: node.degree,
    };
  } else if (pos === 0) {
    // fuse with right sibling
  } else {
    // fuse with left sibling
  }
}

function deleteFromNonSingletonNode(node, key, val) {
  let keyloc = findKey(node, key);
  if (keyloc.found) {
    let succNode = node.children[keyloc.pos + 1];
    if (succNode === null) { // leaf node
      return {
        keyEntries: [...node.keyEntries.slice(0, keyloc.pos), ...node.keyEntries.slice(keyloc.pos + 1)],
        valEntries: [...node.valEntries.slice(0, keyloc.pos), ...node.valEntries.slice(keyloc.pos + 1)],
        children: [...node.children.slice(0, keyloc.pos), ...node.children.slice(keyloc.pos + 1)], // should all be null anyway - could be simpler
        degree: node.degree - 1,
      }
    } else {
      let succ = getMin(succNode);
      let adjustedNode = adjustForDelete(node, keyloc.pos + 1);
      keyloc = findKey(adjustedNode, key);
      if (keyloc.found) { // still in this node
        return {
          keyEntries: [...adjustedNode.keyEntries.slice(0, keyloc.pos + 1), succ.key, ...adjustedNode.keyEntries.slice(keyloc.pos + 2)],
          valEntries: [...adjustedNode.valEntries.slice(0, keyloc.pos + 1), succ.val, ...adjustedNode.valEntries.slice(keyloc.pos + 2)],
          children: [...adjustedNode.children.slice(0, keyloc.pos + 1), deleteFromNonSingletonNode(adjustedNode.children[keyloc.pos + 1], succ.key, succ.val), ...adjustedNode.children.slice(keyloc.pos + 2)],
          degree: adjustedNode.degree,
        };
      } else {
        return {
          keyEntries: adjustedNode.keyEntries.slice(0),
          valEntries: adjustedNode.valEntries.slice(0),
          children: [...adjustedNode.children.slice(0, keyloc.pos), deleteFromNonSingletonNode(adjustedNode.children[keyloc.pos], key, val), ...adjustedNode.children.slice(keyloc.pos + 1)],
          degree: adjustedNode.degree,
        };
      }
    }
  } else {
    if (node.children[keyloc.pos] === null) {
      // got to the leaf, but key ain't here
      // could either throw exception or just return unchanged
      throw new Error('Key not found');
    }
    let adjustedNode = adjustForDelete(node, keyloc.pos);
    keyloc = findKey(adjustedNode, key);
    if (keyloc.found) {
      throw new Error('This shouldn\'t be possible');
    }
    return {
      keyEntries: adjustedNode.keyEntries.slice(0),
      valEntries: adjustedNode.valEntries.slice(0),
      children: [...adjustedNode.children.slice(0, keyloc.pos), deleteFromNonSingletonNode(adjustedNode.children[keyloc.pos], key, val), ...adjustedNode.children.slice(keyloc.pos + 1)],
      degree: adjustedNode.degree,
    };
  }
}

function getMin(node) {
  while (node.children[0] !== null) {
    node = node.children[0];
  }
  return {key: node.keyEntries[0], val: node.valEntries[0]};
}

function getMax(node) {
  while (node.children[node.degree-1] !== null) {
    node = node.children[node.degree-1];
  }
  return {key: node.keyEntries[node.degree-2], val: node.valEntries[node.degree - 2]};
}

function findPathToKey(node, key) {
  let res = [], keyloc;
  while (node !== null) {
    keyloc = findKey(node, key);
    res.push(keyloc.pos);
    if (keyloc.found) {
      return {
        node: node,
        path: res,
        val: keyloc.val
      };
    }
    node = node.children[keyloc.pos];
  }
  return undefined;
}

function subSuccessor(node, key) {
  // returns the smallest element in the right subtree
}

function inorder(node) {
  if (node === null) {
    return [];
  } else if (node.children[0] === null) { // leaf
    return node.keyEntries.map((x,i) => {
      let kv = {};
      kv[x] = node.valEntries[i];
      return kv;
    });
  } else {
    let res = [], i;
    for (i=0; i < node.degree - 1; i++) {
      let kv = {};
      kv[node.keyEntries[i]] = node.valEntries[i];
      res.push(...inorder(node.children[i]), kv);
    }
    res.push(...inorder(node.children[i]));
    return res;
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
    let nodePath = findPathToKey(this.root, key);
    console.log(nodePath.path);
    return nodePath ? nodePath.val : undefined;
  }

  put(key, val) {
    if (typeof val === "undefined") {
      val = key;
    }
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

  min() {
    if (this.root === null) {
      return undefined;
    } else {
      return getMin(this.root);
    }
  }

  max() {
    if (this.root === null) {
      return undefined;
    } else {
      return getMax(this.root);
    }
  }

  contents() {
    return inorder(this.root);
  }

  toString() {
    return JSON.stringify(this.root,null,2);
  }
}

module.exports = B234Tree;
