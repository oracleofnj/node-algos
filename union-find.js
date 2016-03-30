class UnionFind {
  constructor(arrItems) {
    if (typeof arrItems === 'undefined') {
      arrItems = [];
    }
    if (!Array.isArray(arrItems)) {
      throw new Error('UnionFind constructor arguments must be an array');
    }
    this.parents = {};
    this.sizes = {};
    arrItems.forEach(item => {
      this.parents[item] = item;
      this.sizes[item] = 1;
    });
  }

  findRoot(item) {
    while (this.parents[item] !== item) {
      item = this.parents[item];
    }
    return item;
  }

  depth(item) {
    let i = 0;
    while (this.parents[item] !== item) {
      item = this.parents[item];
      i++;
    }
    return i;
  }

  merge(item1, item2) {
    let root1 = this.findRoot(item1), root2 = this.findRoot(item2);
    if (root1 !== root2) {
      if (this.sizes[root1] > this.sizes[root2]) {
        // root1 is larger, merge root2 into root1
        this.parents[root2] = root1;
        this.sizes[root1] += this.sizes[root2];
      } else {
        // root1 size <= root2, merge root1 into root2
        this.parents[root1] = root2;
        this.sizes[root2] += this.sizes[root1];
      }
    }
  }

  isConnected(item1, item2) {
    return this.findRoot(item1) === this.findRoot(item2);
  }

  toString() {
    return JSON.stringify({parents: this.parents, sizes: this.sizes});
  }
}

module.exports = UnionFind;
