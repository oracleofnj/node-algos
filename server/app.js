'use strict';
let express = require('express');
let app = express();
let percolation = require('../api-clients/percolation.js');

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname + '/public/'});
});

app.get('/client.js', function(req, res) {
  res.sendFile('client.js', {root: __dirname + '/public/'});
});

app.get('/percolation/:n', function(req, res) {
  res.send(percolation(100, req.params.n, req.params.n));
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000');
});
