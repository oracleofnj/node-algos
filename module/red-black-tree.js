'use strict';
const RED = true, BLACK = false;

function RBTNode(parent, key, val, color) {
  return {
    parent: parent,
    key: key,
    val: val,
    color: ((typeof color === undefined) ? BLACK : (color ? RED : BLACK)),
    leftChild: null,
    rightChild: null,
  }
}

class RedBlackTree {
  constructor() {
    this.root = null;
  }

  static isRed(node) {
    return (node !== null) && (node.color === RED);
  }

  

}
