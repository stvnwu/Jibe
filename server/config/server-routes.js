// server-routes.js -- server api and routes
// ----------------------------------------------
var bodyParser = require('body-parser');
var request = require('request');

var Party = require('./db-config.js');
// var Song = require('./db-config.js');

exports.getPlaylist = function (req, res) {
  console.log('Get playlist.');
};

exports.createParty = function (req, res) {
  console.log('Create party.');
  // Party name
  var name = req.body.name;
  var owner = req.body.owner || 'anonymous';

  Party.findOne({ name: name })
    .exec(function(err, party) {
      if (!party) {
        var newParty = new Party({
          name: name,
          owner: owner,
          playlist: []
        });

        newParty.save(function(err, newParty) {
          if (err) {
            console.log('Error: cannot add party to database.');
            res.status(418).end();
          } else {
            console.log('Success: party added to database.');
            res.status(201).end();
          }
        });
      } else {
        console.log('Error: party already exists in database.');
        res.status(418).end();
      }
    });
};

exports.joinParty = function (req, res) {
  console.log('Join party.');
  // Party name
  var party = req.body.name;
  console.log('body', req.body);
  
  Party.findOne({name: party })
    .exec(function(err, party) {
      if (!party) {
        // No party. Teapot.
        console.log('Error: no party with that name.');
        res.status(404).end();
      } else {
        console.log('Success: time to party.');
        res.status(201).end();
      }
  });

};

exports.addSong = function (req, res) {
  console.log('Add song to db.');
  // Song parameters
  var song = {
    party: req.body.party,
    title: req.body.title,
    uri: req.body.uri,
    score: req.body.score
  }

  //finds if the party is alredy in the database
  Party.findOne({ name: song.party})
    .exec(function(err, party){
      if(!party){
        console.log('Error: party was not found.');
        res.status(418).end();
      } else {
        party.playlist.push(song);

        Party.update({_id: party._id}, {$set: {playlist: party.playlist}}, function(err){
          if (err){
            return err;
          } else {
            console.log('Success: party was updated.');
          }
        });
        res.status(201).end();
      }
    });
  }


exports.upvote = function (req, res) {
  console.log('Upvote song.');

};

exports.downvote = function (req, res) {
  console.log('Downvote song.');

};


/* COPIED FROM BEER TAB
var bodyParser = require('body-parser');
var request = require('request');
var jwt = require('jwt-simple');

var User = require('./db-config.js');

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password,
          network: {}
        });

        newUser.save(function(err, newUser) {
          if (err) {
            res.status(418).end();
          } else {
            var token = jwt.encode(user, 'argleDavidBargleRosson');
            res.json({token: token});
            console.log('Success: Account added to database.');
            res.status(201).end();
          }
        });
      } else {
        console.log('Error: Account already exists');
        res.status(418).end();
      }
    });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .exec(function(err, user) {

      if (!user) {
        res.status(418).end();
      } else {
        var savedPassword = user.password;
        user.comparePassword(password, savedPassword, function(err, match) {
          if (match) {
            var token = jwt.encode(user, 'argleDavidBargleRosson');
            res.json({token: token});
            console.log('Success: Logged in');
            res.status(201).end();

          } else {
            console.log('Error: Incorrect password');
            res.status(418).end();
          }
        });
      }
  });
};


exports.getTable = function(req, res){
  //Here we distribute the data we received from the request
  var user = req.body.user;
  //we need a temporal variable to use the update method on the db.
  var temp;

  //This query finds the receiver in the db
  User.findOne({ username: user })
    .exec(function(err, user) {
      if(!user) {
        console.log('attempted to route to tabs, but person not found!');
        res.status(500).end();
      } else {
        res.status(201).send(user.network);
      }

    });
};


exports.toTabs = function(req, res){
  //Here we distribute the data we received from the request
  var receiver = req.body.user;
  //since we got a token we need to decode it first
  var decoded = jwt.decode(req.body.token, 'argleDavidBargleRosson');
  var sender = decoded.username;
  //we need a temporal variable to use the update method on the db.
  var temp;
//this ensures that a user is unale to owe to itself
if(receiver === sender){
  console.log('You can\'t owe yourself!');
  res.status(418).end();
} else if(!receiver){ //this prevents the server from processing an undefined value
  console.log('Sending beer to undefined');
  res.status(500).end();
} else {
    //This query finds the receiver in the db
    User.findOne({ username: receiver })
      .exec(function(err, user) {
        if(!user) {
          console.log('attempted to route to tabs, but person not found!');
          res.status(500).end();
        } else {

            //if the receiver is on the network of the sender, the number is incremented 
            if(user.network.hasOwnProperty(sender)){
              user.network[sender]++;

            } else {
              //otherwise, we create the relationship
              user.network[sender] = 1;
            }
            //here we assign the entire user object to teh temp variable
            temp = user;
            //We use the update method, here we replace the old
            //network object, with the one insede temp
            User.update({_id: user._id}, {$set: {network: temp.network}}, function(err){
              if (err) return err;
            });

            //this does the exact same thing, but from the sender's perspective  
            User.findOne({ username: sender })
              .exec(function(err, user) {
                if(!user) {
                  console.log('attempted to route to tabs, but person not found!');
                  res.status(500).end();
                } else {
                    //instead of incrementing, the number decreases
                    if(user.network.hasOwnProperty(receiver)){
                      user.network[receiver]--;
                    } else {
                      //the default in this case is negative
                      user.network[receiver] = -1;
                    }
                    //here we assign the entire user object to teh temp variable
                    temp = user;
                    //We use the update method, here we replace the old
                    //network object, with the one insede temp
                    User.update({_id: user._id}, {$set: {network: temp.network}}, function(err){
                      if (err) return err;
                    })
                    //this sends the updated user to the client;
                    res.status(201).send(user);
                  }

              });  
          }
      });
  }
};

*/