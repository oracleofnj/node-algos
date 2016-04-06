'use strict';
let B234Tree = require('../module/b234.js').B234Tree;
let bt = new B234Tree();
bt = bt.put(0);

for (let i = 1; i < parseInt(process.argv[2]); i++) {
  bt = bt.put(i);
}
