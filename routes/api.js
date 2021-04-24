'use strict';
const { Project } = require('../models');
const { Issue } = require('../models');
const mongoose = require('mongoose');
module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res, next) {
      let project = req.params.project;
      let queryObject = req.query
      let queries = Object.keys(queryObject)
      let values = Object.values(queryObject)
      let fields = [];
      Issue.schema.eachPath(pathname => fields.push(pathname))
      for (let i = 0; i < queries.length; i++) {
        if (!fields.includes(queries[i])) {
          return res.json(`invalid search`)
        }
      }


      Project.findOne({ 'project name': project })
        .then(doc => {
          let issues = doc.issues
          if (queries.length > 0) {
            let filtered = issues.filter(x => {
              for (let i = 0; i < queries.length; i++) {
                let quer = x[queries[i]].toString();
                if (quer == values[i]) {
                  return true
                } return false
              }
            })
            if (filtered.length === 0) {
              return res.json('no results found')
            }
            return res.json(filtered)
          }
          res.json(issues)
        });
    })

    .post(function (req, res) {
      let project = req.params.project;

      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body

      if (!issue_text || !issue_title || !created_by) {
        return res.json({ error: 'required field(s) missing' })
      }

      const newIssue = {
        "issue_title": issue_title,
        "issue_text": issue_text,
        "created_by": created_by,
        "assigned_to": assigned_to,
        "status_text": status_text,
        "created_on": new Date(),
        "updated_on": new Date(),
        "open": true
      }

      Project.findOne({ "project name": project }, async function (err, doc) {
        if (!doc) {
          let newiss = new Project({ 'project name': project, issues: [newIssue] })
          await newiss.save();
          res.json(newiss);
          return
        } else {
          doc.issues.push(newIssue);
          await doc.save();
          res.json(doc)
          return
        }
      });
    })

    .put(getIssue, (req, res, next) => {
      let issue = res.issue
      let issue_id = req.body._id;
      if (issue_id == '') {
        return res.json({ error: "missing _id" })
      }
      if (issue == undefined) {
        return res.json({ error: `${issue_id} is an invalid _id` })
      }

      let checkFieldsForEdit = req.body.issue_title || req.body.issue_text || req.body.created_by || req.body.assigned_to || req.body.status_text || req.body.open;

      if (issue.id && checkFieldsForEdit) {
        Project.findOneAndUpdate(
          { 'issues._id': issue_id },
          {
            $set:
            {
              'issues.$.issue_title': req.body.issue_title || res.issue.issue_title,
              'issues.$.issue_text': req.body.issue_text || res.issue.issue_text,
              'issues.$.created_by': req.body.created_by || res.issue.created_by,
              'issues.$.assigned_to': req.body.assigned_to || res.issue.assigned_to,
              'issues.$.status_text': req.body.status_text || res.issue.status_text,
              'issues.$.updated_on': new Date(),
              'issues.$.open': req.body.open || res.issue.open
            }
          },
          function (err, data) {
            if (err) res.send("could not update " + issue_id);
            res.json({ "message": "successfully updated" })
          })
      } else {
        res.json({ "message": "no updated field sent" })
      }

    })

    .delete(getIssue, (req, res, next) => {
      let project = req.params.project
      let issue = res.issue
      let issue_id = req.body._id;
      if (issue == undefined) {
        return res.json({ error: `${issue_id} is an invalid _id` })
      }
      Project.updateOne({ "project name": project }, {
        $pull: {
          "issues": {
            _id: issue_id
          }
        }
      }, (err, doc) => {
        if (doc) {
          res.json({ "message": "successfully deleted " + issue_id })
        } else {
          return res.send({ "message": "could not delete " + issue_id });
          return res.status(404).end(); // justs so the server doesn't hang and keep the frontend waiting forever
        }
      });
    });


  async function getIssue(req, res, next) {
    let project;
    console.log(req.body._id)
    try {
      project = await Project.findOne({ 'project name': req.params.project })
      if (project == null) {
        return res.status(404).json({ message: "Cannot find project" }) // 404 is cannot find something
      } else {
        for (let i of project.issues) {
          if (i._id == req.body._id) {
            // variable on the response object so that we can use  'res.issue'  in every route
            res.issue = i;
          }
        }
        console.log(res.issue)
      }
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
    next()
  }

};
