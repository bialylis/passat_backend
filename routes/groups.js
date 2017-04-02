var groups = {

  getAll: function(req, res) {
    var user = req.user
    var allgroups = data; // Spoof a DB call
    //test
    res.json(allgroups);
  },

  getOne: function(req, res) {
    var user = req.user

    var id = req.params.id;
    var group = data[id]; // Spoof a DB call
    if (group == null) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "No such group"
        });

    }else{
          res.json(group);
    }
  },

  create: function(req, res) {
    var user = req.user

    var newgroup = req.body;
    newgroup['id'] = data.length 

    data.push(newgroup); // Spoof a DB call
    res.json(newgroup);
  },

  update: function(req, res) {
    var user = req.user

    var updategroup = req.body;
    var id = req.params.id;
    if (data[id]!=null) {
          data[id] = updategroup // Spoof a DB call
          res.json(updategroup);
    }else {
        res.status(400);
        res.json({
          "status": 400,
          "message": "No such group"
        });

    }
  },

  delete: function(req, res) {
    var user = req.user

    var id = req.params.id;
    data.splice(id, 1) // Spoof a DB call
    res.json(true);
  }
};

var data = [{
  name: 'user 1',
  id: '0'
}, {
  name: 'user 2',
  id: '1'
}, {
  name: 'user 3',
  id: '2'
}];

module.exports = groups;
