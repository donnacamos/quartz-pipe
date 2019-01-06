/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING);

var issueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String,
  created_on: String,
  updated_on: String,
  open: Boolean
});

var Issue = mongoose.model('Issue', issueSchema);



module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      Issue.find(req.query, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
      });
    }) 
    
     .post(function (req, res){
      var project = req.params.project;
      const required = ["issue_title", "issue_text", "created_by"];
      let b = req.body;
      for (let i = 0; i < required.length; i++) {
        if (b[required[i]].length === 0) {
          return res.send("required fields missing");
        }
      }
      let d = new Date();
      let issueToAdd = new Issue({
        issue_title: b.issue_title,
        issue_text: b.issue_text,
        created_by: b.created_by,
        assigned_to: b.assigned_to,
        status_text: b.status_text,
        created_on: d.toLocaleString(),
        updated_on: d.toLocaleString(),
        open: true
      });
      issueToAdd.save(function(err, data) {
        if (err) return console.error(err);
        res.json(data);
      });
    })
    
      .put(function (req, res){
      var project = req.params.project;
      const keys = Object.keys(req.body);
      let toChange = {};
      keys.forEach(e => {
        if (req.body[e].length > 0 && e !== "_id") {
          toChange[e] = req.body[e];
        }
      });
      if (Object.keys(toChange).length === 0) {
        return res.send("could not update " + req.body._id);
      }
      toChange.updated_on = (new Date()).toLocaleString();
      Issue.findOneAndUpdate({_id: req.body._id}, { $set: toChange }, function(err, data) {
        if (err) return console.error(err);
        return res.send("successfully updated");
      });
    })
    
     .delete(function (req, res){
      if (req.body._id === process.env.SECRET) {
        return Issue.deleteMany({issue_title: 'Title'}, function(err) {
          res.send("Tests deleted");
        });
      }
      if (req.body._id.length === 0 || !mongoose.Types.ObjectId.isValid(req.body._id)) {
        return res.send("_id error");
      };
      Issue.deleteOne(req.body, function(err) {
        if (err) return console.error(err);
        return res.send("deleted " + req.body._id);
      });
    });
    
};