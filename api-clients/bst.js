'use strict';
let BinaryTree = require('../module/index.js').BinaryTree;

let bst = new BinaryTree();
for (let i=0; i < 100; i++) {
  let x = Math.floor(100 * Math.random());
  bst.put(x, x);
}
console.log(bst.contents());
console.log(bst.toString());
