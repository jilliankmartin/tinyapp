const randomString = require("randomstring");

const emailLookup = function(users, email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].email;
    }
  }
  return false;
};

const IDLookup = function(users, email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].ID;
    }
  }
  return false;
};

const urlsForUser = (urlsDB, id) => {
  const filterUrls = {};
  for (const shortURL in urlsDB) {
    const urlObj = urlsDB[shortURL];
    if (urlObj.userID === id) {
      filterUrls[shortURL] = urlObj;
    }
  }
  return filterUrls;
}

const generateRandomString = function(characters) {
  return randomString.generate(characters);
};

module.exports = { emailLookup, IDLookup, urlsForUser, generateRandomString };
