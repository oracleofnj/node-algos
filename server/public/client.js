'use strict';
$(document).ready(function() {
  $('#percolation-submit').click(function() {
    $.getJSON('/percolation/' + $('#percolation-N').val(), function(data) {
      $('#percolation-results').html(JSON.stringify(data));
    });
  });
});
