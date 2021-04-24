const mongoose = require('mongoose')
const { Schema } = mongoose;

const issueSchema = new Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    created_on: Date,
    updated_on: Date,
    open: {
        type: Boolean,
        default: true
    },
})

const Issue = mongoose.model('Issue', issueSchema)

const projectSchema = new Schema({
    'project name': String,
    issues: [issueSchema]
})

const Project = mongoose.model('Projects', projectSchema)


module.exports = { Project, Issue };
