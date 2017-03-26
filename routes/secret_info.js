var secret = {

  get: function(req, res) {
    var d = data; // Spoof a DB call
    res.json(d);
  },

};

var data = [{
  query: "Answer to the Ultimate Question of Life, The Universe, and Everything",
  answer: 'Fourty-Two',
  id: '1'
}];

module.exports = secret;
