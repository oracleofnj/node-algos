'use strict';

function B234Node(key, val, leftChild, rightChild) {
  return {
    keyEntries: [key],
    valEntries: [val],
    children: [((typeof leftChild === 'undefined') ? null : leftChild), ((typeof rightChild === 'undefined') ? null : rightChild)],
    degree: 2,
  };
}

function toString(node) {
  if (node === null) {
    return '(empty)';
  } else {
    if (node.children[0] === null) {
      return JSON.stringify({degree: node.degree, keyEntries: node.keyEntries, valEntries: node.valEntries, children: '(leaf node)'});
    } else {
      return JSON.stringify({degree: node.degree, keyEntries: node.keyEntries, valEntries: node.valEntries, children: node.children.map(x => x.keyEntries)});
    }
  }
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
        console.log(toString(node));
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
          console.log(toString(node));
          throw new Error('key (' + key + ') not < === or > entry[0] (' + node.keyEntries[0] + ')');
        }
      } else if (key > node.keyEntries[1]) {
        res.pos = 2;
      } else {
        console.log(toString(node));
        throw new Error('key  (' + key + ') not < === or > entry[1] (' + node.keyEntries[1] + ')')
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
          console.log(toString(node));
          throw new Error('key (' + key + ') not < === or > entry[0] (' + node.keyEntries[0] + ')');
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
          console.log(toString(node));
          throw new Error('key  (' + key + ') not < === or > entry[2] (' + node.keyEntries[2] + ')');
        }
      } else {
        console.log(toString(node));
        throw new Error('key  (' + key + ') not < === or > entry[1] (' + node.keyEntries[1] + ')');
      }
      break;
    default:
      console.log(toString(node));
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
    keyEntries: [].concat(node.keyEntries.slice(0, keyloc.pos), key, node.keyEntries.slice(keyloc.pos)),
    valEntries: [].concat(node.valEntries.slice(0, keyloc.pos), val, node.valEntries.slice(keyloc.pos)),
    children: [].concat(node.children.slice(0, keyloc.pos), leftChild, rightChild, node.children.slice(keyloc.pos + 1)),
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
      valEntries: [].concat(node.valEntries.slice(0, keyloc.pos), val, node.valEntries.slice(keyloc.pos + 1)),
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
      children: [].concat(res.children.slice(0, keyloc.pos), insertIntoNonFullNode(res.children[keyloc.pos], key, val), res.children.slice(keyloc.pos + 1)),
      degree: res.degree,
    }
  }
}

function adjustForDelete(node, pos) {
  if (node.children[pos].degree > 2) {
    return node;
  }
  if ((pos > 0) && (node.children[pos - 1].degree > 2)) {
    // left sibling has an extra node available: rotate right
    console.log('rotating right');
    let leftChild = node.children[pos - 1], rightChild = node.children[pos];
    return {
      keyEntries: [].concat(node.keyEntries.slice(0, pos - 1), leftChild.keyEntries[leftChild.degree - 2], node.keyEntries.slice(pos)),
      valEntries: [].concat(node.valEntries.slice(0, pos - 1), leftChild.valEntries[leftChild.degree - 2], node.valEntries.slice(pos)),
      children: [].concat(
        node.children.slice(0, pos - 1),
        {
          keyEntries: leftChild.keyEntries.slice(0, -1),
          valEntries: leftChild.valEntries.slice(0, -1),
          children: leftChild.children.slice(0, -1),
          degree: leftChild.degree - 1,
        },
        {
          keyEntries: [].concat(node.keyEntries[pos - 1], rightChild.keyEntries.slice(0)),
          valEntries: [].concat(node.valEntries[pos - 1], rightChild.valEntries.slice(0)),
          children: [].concat(leftChild.children[leftChild.degree - 1], rightChild.children.slice(0)),
          degree: rightChild.degree + 1,
        },
        node.children.slice(pos + 1)),
      degree: node.degree,
    };
  } else if ((pos < (node.degree - 1)) && (node.children[pos + 1].degree > 2)) {
    // right sibling has an extra node available: rotate left
    console.log('rotating left');
    let leftChild = node.children[pos], rightChild = node.children[pos + 1];
    return {
      keyEntries: [].concat(node.keyEntries.slice(0, pos), rightChild.keyEntries[0], node.keyEntries.slice(pos + 1)),
      valEntries: [].concat(node.valEntries.slice(0, pos), rightChild.valEntries[0], node.valEntries.slice(pos + 1)),
      children: [].concat(
        node.children.slice(0, pos),
        {
          keyEntries: [].concat(leftChild.keyEntries.slice(0), node.keyEntries[pos]),
          valEntries: [].concat(leftChild.valEntries.slice(0), node.valEntries[pos]),
          children: [].concat(leftChild.children.slice(0), rightChild.children[0]),
          degree: leftChild.degree + 1,
        },
        {
          keyEntries: rightChild.keyEntries.slice(1),
          valEntries: rightChild.valEntries.slice(1),
          children: rightChild.children.slice(1),
          degree: rightChild.degree - 1,
        },
        node.children.slice(pos + 2)),
      degree: node.degree,
    };
  } else {
    if (node.degree <= 2) {
      throw new Error('Asked to adjust a singleton node for deletion');
    } else {
      if (pos === 0) {
        // fuse with right sibling
        console.log('fusing child 0 with child 1');
        let leftChild = node.children[pos], rightChild = node.children[pos + 1];
        return {
          keyEntries: node.keyEntries.slice(pos + 1),
          valEntries: node.valEntries.slice(pos + 1),
          children: [].concat(
            {
              keyEntries: [].concat(leftChild.keyEntries.slice(0), node.keyEntries[pos], rightChild.keyEntries.slice(0)),
              valEntries: [].concat(leftChild.valEntries.slice(0), node.valEntries[pos], rightChild.valEntries.slice(0)),
              children: [].concat(leftChild.children.slice(0), rightChild.children.slice(0)),
              degree: leftChild.degree + rightChild.degree, // degree = number of children, which didn't change
            },
            node.children.slice(pos + 2)
          ),
          degree: node.degree - 1,
        }
      } else {
        // fuse with left sibling
        console.log('fusing child ' + pos + ' with child ' + (pos - 1));
        let leftChild = node.children[pos - 1], rightChild = node.children[pos];
        return {
          keyEntries: [].concat(node.keyEntries.slice(0, pos-1), node.keyEntries.slice(pos)),
          valEntries: [].concat(node.keyEntries.slice(0, pos-1), node.keyEntries.slice(pos)),
          children: [].concat(
            node.children.slice(0, pos-1),
            {
              keyEntries: [].concat(leftChild.keyEntries.slice(0), node.keyEntries[pos-1], rightChild.keyEntries.slice(0)),
              valEntries: [].concat(leftChild.valEntries.slice(0), node.valEntries[pos-1], rightChild.valEntries.slice(0)),
              children: [].concat(leftChild.children.slice(0), rightChild.children.slice(0)),
              degree: leftChild.degree + rightChild.degree, // degree = number of children, which didn't change
            },
            node.children.slice(pos+1)
          ),
          degree: node.degree - 1,
        }
      }
    }
  }
}

function deleteFromNonSingletonNode(node, key) {
  let keyloc = findKey(node, key);
  if (keyloc.found) {
    let succNode = node.children[keyloc.pos + 1];
    if (succNode === null) { // leaf node
      return {
        keyEntries: [].concat(node.keyEntries.slice(0, keyloc.pos), node.keyEntries.slice(keyloc.pos + 1)),
        valEntries: [].concat(node.valEntries.slice(0, keyloc.pos), node.valEntries.slice(keyloc.pos + 1)),
        children: [].concat(node.children.slice(0, keyloc.pos), node.children.slice(keyloc.pos + 1)), // should all be null anyway - could be simpler
        degree: node.degree - 1,
      }
    } else {
      let succ = getMin(succNode);
      console.log('Adjusting node: ' + toString(node));
      let adjustedNode = adjustForDelete(node, keyloc.pos + 1);
      console.log('Adjusted node: ' + toString(adjustedNode));
      keyloc = findKey(adjustedNode, key);
      if (keyloc.found) { // still in this node
        return {
          keyEntries: [].concat(adjustedNode.keyEntries.slice(0, keyloc.pos + 1), succ.key, adjustedNode.keyEntries.slice(keyloc.pos + 2)),
          valEntries: [].concat(adjustedNode.valEntries.slice(0, keyloc.pos + 1), succ.val, adjustedNode.valEntries.slice(keyloc.pos + 2)),
          children: [].concat(
            adjustedNode.children.slice(0, keyloc.pos + 1),
            deleteFromNonSingletonNode(adjustedNode.children[keyloc.pos + 1], succ.key),
            adjustedNode.children.slice(keyloc.pos + 2)
          ),
          degree: adjustedNode.degree,
        };
      } else {
        return {
          keyEntries: adjustedNode.keyEntries.slice(0),
          valEntries: adjustedNode.valEntries.slice(0),
          children: [].concat(
            adjustedNode.children.slice(0, keyloc.pos),
            deleteFromNonSingletonNode(adjustedNode.children[keyloc.pos], key),
            adjustedNode.children.slice(keyloc.pos + 1)
          ),
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
    console.log('Adjusting node: ' + toString(node));
    let adjustedNode = adjustForDelete(node, keyloc.pos);
    console.log('Adjusted node: ' + toString(adjustedNode));
    keyloc = findKey(adjustedNode, key);
    if (keyloc.found) {
      throw new Error('This shouldn\'t be possible');
    }
    return {
      keyEntries: adjustedNode.keyEntries.slice(0),
      valEntries: adjustedNode.valEntries.slice(0),
      children: [].concat(
        adjustedNode.children.slice(0, keyloc.pos),
        deleteFromNonSingletonNode(adjustedNode.children[keyloc.pos], key),
        adjustedNode.children.slice(keyloc.pos + 1)
      ),
      degree: adjustedNode.degree,
    };
  }
}

function deleteFromRoot(root, key) {
  let res = new B234Tree();
  res.keyType = typeof key;
  if (root.degree > 2) {
    res.root = deleteFromNonSingletonNode(root, key);
  } else {
    if (root.children[0] === null) { // there is only one entry in this tree - it had better be equal to key
      if (root.keyEntries[0] !== key) {
        throw new Error('Key not found');
      } else {
        res.root = null;
      }
    } else {
      if (root.children[0].degree === 2 && root.children[1].degree === 2) {
        let leftChild = root.children[0], rightChild = root.children[1];
        root = {
          keyEntries: [].concat(leftChild.keyEntries.slice(0), root.keyEntries[0], rightChild.keyEntries.slice(0)),
          valEntries: [].concat(leftChild.valEntries.slice(0), root.valEntries[0], rightChild.valEntries.slice(0)),
          children: [].concat(leftChild.children.slice(0), rightChild.children.slice(0)),
          degree: leftChild.degree + rightChild.degree,
        };
      }
      res.root = deleteFromNonSingletonNode(root, key);
    }
  }
  return res;
}

function insertIntoRoot(root, key, val) {
  let res = new B234Tree();
  res.keyType = typeof key;
  if (root === null) {
    res.root = B234Node(key, val);
  } else {
    if (root.degree === 4) {
      root = splitNode(null, root);
    }
    res.root = insertIntoNonFullNode(root, key, val);
  }
  return res;
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
      res = res.concat(inorder(node.children[i]), kv);
    }
    res = res.concat(inorder(node.children[i]));
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
//    if (nodePath) { console.log(nodePath.path); }
    return nodePath ? nodePath.val : undefined;
  }

  put(key, val) {
    if (typeof val === "undefined") {
      val = key;
    }
    if (this.root !== null && this.keyType !== typeof key) {
      throw new Error('key type (' + typeof key + ') doesn\'t match tree key type (' + this.keyType + ')');
    }
    return insertIntoRoot(this.root, key, val);
  }

  del(key) {
    if (this.keyType !== typeof key) {
      throw new Error('key type (' + typeof key + ') doesn\'t match tree key type (' + this.keyType + ')');
    }
    return deleteFromRoot(this.root, key);
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

module.exports = {B234Tree, toString};
