'use strict';
let UnionFind = require('./union-find.js');

const ITERS_PER_N = 1000, N_MIN = 128, N_MAX = 128;

let init = [], N, results = {};
for (let i=0; i < N_MAX * N_MAX + 2; i++) {
  init.push(i);
}

for (N = N_MIN; N <= N_MAX; N *= 2) {
  results[N] = [];
  for (let iter = 0; iter < ITERS_PER_N; iter++) {

    // initialize the data structure
    let uf = new UnionFind(init.slice(0, N * N + 2));
    let openCells = Array(N*N+1).fill(false);

    for (let i=0; i < N * N; i++) {

      let cell;
      do {
        cell = 1 + Math.floor(N*N * Math.random());
      } while (openCells[cell]);

      let
        is_top = (cell <= N),
        is_bottom = (cell > N * (N-1)),
        is_left = (0 === cell % N),
        is_right = ((N-1) === cell % N);

      if (is_top) {
        uf.merge(cell, 0);
      } else if (openCells[cell - N]) {
        uf.merge(cell, cell - N);
      }

      if (is_bottom) {
        uf.merge(cell, N*N+1);
      } else if (openCells[cell + N]) {
        uf.merge(cell, cell + N);
      }

      if (!is_left && openCells[cell - 1]) {
        uf.merge(cell, cell - 1);
      }

      if (!is_right && openCells[cell + 1]) {
        uf.merge(cell, cell + 1);
      }

      openCells[cell] = true;
      if (uf.isConnected(0, N * N + 1)) {
        results[N].push(i);
        break;
      }
    }
  }
}

console.log(results);
