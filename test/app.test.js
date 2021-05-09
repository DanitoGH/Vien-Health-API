"use strict";

let assert = require('chai').assert;
const request = require('supertest');
let app = require('../app');

let _user = 'integration_test@gmail.com';

describe('Authentication Controller', () => {

  it('should register a new user and return token', (done) => {
    let _token = null;
    return request(app)
      .post('/auth/register')
      .send({
        email: _user,
        password: 'integration',
        name: 'Integration Test'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(201, done())
      .then((data) => {
        _token = data.body.token
        assert.ok(_token)
        done()
      })
  })

  it('should login existing User', (done) => {
    let _token = null;
    return request(app)
      .post('/api/auth/login')
      .send({
        email: _user,
        password: 'integration'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200, done())
      .then((data) => {
        _token = data.body.token;
        assert.ok(_token);
        done()
      })
  })

  it('should return an error bad request if email is used', (done) => {
    return request(app)
      .post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: _user,
        password: 'integration',
        name: 'Integration Test'
      })
      .expect({
        error: { status: 400, message: 'Email already taken!'},
      }, done())
      .catch(err => done(err))
  })

  it('should return an error bad request if email isn\'t specified', () => {
    return request(app)
      .post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        password: 'integration',
        name: 'Integration Test'
      })
      .expect(400)
      .catch(err => done(err))
  })

  it('should return an error bad request if password isn\'t specified', () => {
    return request(app)
      .post('/api/auth/register')
      .send({
        email: _user,
        name: 'Integration Test'
      })
      .expect(400)
      .catch(err => done(err))
  })
})