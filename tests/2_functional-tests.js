const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    suite('post tests', () => {
        test('issue with every field', (done) => {
            chai.request(server)
                .post('/api/issues/:project')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In QA'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body.issues[0], 'issue_title');
                    assert.property(res.body.issues[0], 'issue_text');
                    assert.property(res.body.issues[0], 'created_on');
                    assert.property(res.body.issues[0], 'updated_on');
                    assert.property(res.body.issues[0], 'created_by');
                    assert.property(res.body.issues[0], 'assigned_to');
                    assert.property(res.body.issues[0], 'open');
                    assert.property(res.body.issues[0], 'status_text');
                    assert.property(res.body.issues[0], '_id');
                    done();
                })
        })
        test('issue with only required fields', (done) => {
            chai.request(server)
                .post('/api/issues/:project')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isNull(err, 'there was no error');
                    assert.exists(res.body.issues[0].issue_title, 'issue_title is neither `null` nor `undefined`');
                    assert.exists(res.body.issues[0].issue_text, 'issue_text is neither `null` nor `undefined`');
                    assert.exists(res.body.issues[0].created_by, 'created_by is neither `null` nor `undefined`');
                    assert.isNotEmpty('issue_title');
                    assert.isNotEmpty('issue_text');
                    assert.isNotEmpty('created_by');
                    done();
                })
        })
        test('issue with missing required fields', (done) => {
            chai.request(server)
                .post('/api/issues/:project')
                .send({
                    issue_title: '',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field filled in',
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, '{"error":"required field(s) missing"}', '== error is missing inputs')
                    done();
                })
        })
    })
    suite('get tests', () => {
        test('view issues on project', (done) => {
            chai.request(server)
                .get('/api/issues/:project')
                .query({})
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                })
        });


        test('One filter', function (done) {
            chai.request(server)
                .get('/api/issues/:project')
                .query({ open: "true" })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });

        test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
            chai.request(server)
                .get('/api/issues/:project')
                .query({ open: "true", issue_title: "f23buion3fr" })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });
    });
    suite('put tests', () => {
        test('update one field', (done) => {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '6082740eb6954f9019c8d53e',
                    created_by: "functional test - One field to update"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.message, 'successfully updated', '== successfully updated')
                    done();
                });
        })
        test('update multiple fields', (done) => {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '6082740eb6954f9019c8d53e',
                    created_by: "functional test - Multiple fields to update",
                    assigned_to: "bob"
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.message, 'successfully updated', '== successfully updated')
                    done();
                });
        });
        test('no fields to update', function (done) {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '6083543faba9eb9c28b55157'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.message, 'no updated field sent', '== no updated field sent')
                    done();
                });
        });

    })
    suite('DELETE /api/issues/{project} => text', function () {

        test('No _id', function (done) {
            chai.request(server)
                .delete('/api/issues/apitest')
                .send({
                    _id: null,
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'null is an invalid _id');
                    done();
                });
        });

        test('Valid _id', function (done) {
            chai.request(server)
                .delete('/api/issues/:project')
                .send({
                    _id: '608360f9a066e49f0b6f2fcc',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.message, 'successfully deleted 608360f9a066e49f0b6f2fcc');
                    done();
                });
        });
        test('invalid _id', function (done) {
            chai.request(server)
                .delete('/api/issues/:project')
                .send({
                    _id: 's',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 's is an invalid _id');
                    done();
                });
        });
    });
});

