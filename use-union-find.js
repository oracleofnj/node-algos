'use strict';
let UnionFind = require('./union-find.js');
let init = [];
const iMax = parseInt(process.argv[2], 10), multiple = parseFloat(process.argv[3]);

for (let i=0; i < iMax; i++) {
  init.push(i);
}

let uf = new UnionFind(init);
for (let i=0; i < iMax * multiple; i++) {
  let a = Math.floor(Math.random() * iMax), b =  Math.floor(Math.random() * iMax);
  uf.merge(a, b);
}

let avgDepth = 0, maxDepth = 0, d = 0;
for (let i=0; i < iMax; i++) {
  d = uf.depth(i);
  avgDepth += d / iMax;
  maxDepth = Math.max(d, maxDepth);
}
console.log(avgDepth, maxDepth);

for (let i=0; i < 10; i++) {
  console.log(uf.parents[i]);
}
