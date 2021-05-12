"use strict";

let assert = require('chai').assert;
const request = require('supertest');
let app = require('../app');

let _user = 'integration_test_' + Math.floor(Date.now() / 1000) + '@alttab.co';

describe('Authentication Controller', () => {
    let _token = null;
  it('should register a new user and return token', (done) => {
      request(app)
      .post('/api/auth/register')
      .send({
        email: _user,
        password: 'integration',
        name: 'Integration Test'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        _token = res.body.token
        assert.ok(_token)
        return done()
      })
  })

  it('should login existing User', (done) => {
     request(app)
      .post('/api/auth/login')
      .send({
        email: _user,
        password: 'integration'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        _token = res.body.token
        assert.ok(_token)
        return done()
      })
  })

  it('should return an error bad request if email is used', () => {
    request(app)
      .post('/api/auth/register')
      .set('Accept', 'application/json')
      .send({
        email: _user,
        password: 'integration',
        name: 'Integration Test'
      })
      .expect(400)
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
  })

  it('should return an error bad request if password isn\'t specified', () => {
    return request(app)
      .post('/api/auth/register')
      .send({
        email: _user,
        name: 'Integration Test'
      })
      .expect(400)
  })

  it('should logout authenticated User', (done) => {
        request(app)
        .delete('/api/auth/logout')
        .set('Authorization', 'Bearer '+ _token)
        .expect(204, done())
    })

    it('should return an error when authenticated user refresh token is not specified', (done) => {
        request(app)
        .delete('/api/auth/logout')
        .expect(401, done())
    })
})

describe('Profile controller', () => {
  let _token = null

  before((done) => {
   request(app)
    .post('/api/auth/login')
    .send({
      email: _user,
      password: 'integration'
    })
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        return done(err)
      }
      _token = res.body.token
      assert.ok(_token)
      return done()
    })
  })

  it('should fetch the profile info of existing user', (done) => {
    request(app)
      .get('/api/auth/profile')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '+ _token)
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        assert.equal(res.body.email, _user)
        return done()
      })
  })

  it('should return an error when token is not specified', () => {
    return request(app)
      .get('/api/auth/profile')
      .expect(401)
  })
})