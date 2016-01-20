'use strict';

const typing = require('../customCommands')({
  valueStep: 100,
  currency: '£',
  delimiterDeleteStrategy: 'DELETE_NUMBER'
});

describe('With currency', function() {

  // // Shortcuts
  // typing('k').shouldShow('£1,000');
  // typing('m').shouldShow('£1,000,000');
  // typing('b').shouldShow('£1,000,000,000');
});
