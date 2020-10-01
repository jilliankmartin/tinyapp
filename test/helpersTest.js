const { assert } = require('chai');

const { emailLookup } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should match the inputted email to an email in the DB and return that email if it exists', function() {
    const user = emailLookup(testUsers, "user@example.com")
    const expectedOutput = "user@example.com";
    assert.equal(user, expectedOutput);
  });

  it('should return false if the user email inputted does not exist in the database', function() {
    const user = emailLookup(testUsers, "user1@example.com")
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});