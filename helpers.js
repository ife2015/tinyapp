const bcrypt = require('bcrypt');

const getUserByEmail = function(userDatabase, useremail) {
  for (let userId in userDatabase) {
    if (useremail === userDatabase[userId].email) {
      return userDatabase[userId];
    }
  }
  return false;
};

//function generates a string for both user id and short url
const generateRandomString = function() {
  let text = '';
  const alphaNumberic = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += alphaNumberic.charAt(Math.floor(Math.random() * alphaNumberic.length));
  }
  return text;
};

// function filters set of urls belonging to the specific user
const urlsForUser = function(urlDatabase, id) {
  let urlsData = {};
  for (let user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      urlsData[user] = urlDatabase[user].longURL;
    }
  }
  return urlsData;
};

// function compares user password with hashpasweord
const authenticateUser = function(userDatabase, email, password) {
  const user = getUserByEmail(userDatabase, email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser, authenticateUser};