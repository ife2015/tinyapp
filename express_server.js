// imported functions from helpers.js
const { getUserByEmail, generateRandomString, urlsForUser, authenticateUser } = require('./helpers.js');

const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const bcrypt = require('bcrypt');

// middleware 
app.set('view engine', 'ejs');
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.use(bodyParser.urlencoded({ extended: true }));

// user databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  'aJ48lW': {
    id: 'aJ48lW',
    email: "ifemastero@yahoo.com",
    password: "zxc"
  }
};

app.get('/urls', (request, response) => {
  const templateVars = {
    user_id: users[request.session.user_id],
    urls: urlsForUser(urlDatabase, request.session.user_id),
  };

  //Checks if user id is present
  if (request.session.user_id === undefined) {
    // if not, redirects to login
    response.redirect('/login');
  } else {
    // if so redirects to list of urls user has
    response.render('urls_index', templateVars);
  }
});

// page for entering new urls 
app.get('/urls/new', (request, response) => {
  const templateVars = {
    user_id: users[request.session.user_id]
  }

  //Checks if user id is present
  if (request.session.user_id === undefined) {
    // if not, redirects to login
    response.redirect('/login');
  } else {
    // if so redirects user to enter new url to be shortened
    response.render('urls_new', templateVars);
  }
});

// shows the specific short url created for the specific long url
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = {
    user_id: request.session.user_id,
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    urlUserId: urlDatabase[request.params.shortURL].userID
  };

  response.render('urls_show', templateVars);
});

// specific short url link is redirected to the page of the long url 
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// renders register page
app.get('/register', (request, response) => {
  const templateVars = {
    user_id: users[request.session.user_id]
  }
  response.render('urls_regis', templateVars);
});

// renders the login page 
app.get('/login', (request, response) => {
  const templateVars = {
    user_id: users[request.session.user_id]
  }
  response.render("urls_login", templateVars);
});

// the delete button attached to specific short url
app.post('/urls/:shortURL/delete', (request, response) => {
  const shortURLname = request.params.shortURL;
  delete urlDatabase[shortURLname];
  response.redirect('/urls');
});

// editing the short and long urls from the body
app.post('/urls/:shortURL', (request, response) => {
  const shortURLname = request.params.shortURL;
  const longURLname = request.body.longURL;
  const userID = request.session.user_id

  if (userID) {
    urlDatabase[shortURLname] = { longURL: longURLname, userID: userID };
    response.redirect('/urls');
  }
});

// add short and long urls to the list of urls 
app.post('/urls', (request, response) => {
  const randomDigits = generateRandomString();
  const userID = request.session.user_id;

  if (userID) {
    urlDatabase[randomDigits] = { longURL: request.body.longURL, userID: userID };
    response.redirect(`/urls/${randomDigits}`);
    console.log(urlDatabase);
  }
});

// captures email and password from the html body
app.post('/login', (request, response) => {
  const { email, password } = request.body;

  const userId = authenticateUser(users, email, password);

  if (!userId) {
    response.status(403).send("Email or Password don't match");
  } else {
    request.session.user_id = userId;
    response.redirect('/urls');
  }
});

// logout submission and clears cookies
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/urls');
});

// edit registration 
app.post('/register', (request, response) => {
  const { email, password } = request.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  // no user or password input 
  if (email === "" || password === "") {
    response.status(400).send("Email or Password is empty");
    return;
  }

  // checks if email is in user database
  if (getUserByEmail(users, email) === true) {
    response.status(400).send("Email is already in the system!");
    return;
  }

  users[userID] = { id: userID, email, password: hashedPassword };

  request.session.user_id = userID;
  response.redirect('/urls');
});

// listen for server connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


