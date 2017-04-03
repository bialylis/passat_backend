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
    var maxid = 0;
    for(var i=0; i<data.length; i++){
        if (data[i].id > maxid) {
          maxid = data[i].id;
        }
    }
    newgroup['id'] = maxid+1; 

    data.push(newgroup); // Spoof a DB call
    res.json(newgroup);
  },

  update: function(req, res) {
    var user = req.user

    var updategroup = req.body;
    var id = req.params.id;
    for(var i = 0; i<data.length; i++){
      if (data[i].id == id) {
          data[i] = updategroup // Spoof a DB call
          res.json(updategroup);
          return;
      }
    }
    
    res.status(400);
    res.json({
      "status": 400,
      "message": "No such group"
    });

    
  },

  delete: function(req, res) {
    var user = req.user
    var id = req.params.id;

    for(var i = 0; i<data.length; i++){
      if (data[i].id == id) {
         data.splice(i, 1) // Spoof a DB call
      }
    }
    

    res.json(true);
  }
};

var data = [{
  name: 'group 1',
  id: 0
}, {
  name: 'group 2',
  id: 1
}, {
  name: 'group 3',
  id: 2
}];

module.exports = groups;
