// test/app-test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Test that the app is running', function() {
  describe('/', function() {
    it('responds with 200', function(done) {
      chai.request(app).get('/').end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
    });
  });
});
