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

app.get('/urls', (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id],
    urls: urlsForUser(urlDatabase, req.session.user_id),
  };

  //Checks if user id is present
  if (req.session.user_id === undefined) {
    // if not, redirects to login
    res.redirect('/login');
  } else {
    // if so redirects to list of urls user has
    res.render('urls_index', templateVars);
  }
});

// page for entering new urls 
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  }

  //Checks if user id is present
  if (req.session.user_id === undefined) {
    // if not, redirects to login
    res.redirect('/login');
  } else {
    // if so redirects user to enter new url to be shortened
    res.render('urls_new', templateVars);
  }
});


// shows the specific short url created for the specific long url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserId: urlDatabase[req.params.shortURL].userID, 
    useridname:req.session.user_id
  };

  res.render('urls_show', templateVars);
});


// specific short url link is redirected to the page of the long url 
app.get('/u/:shortURL', (req, res) => {
  const longUrlLink = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longUrlLink);
});


// renders register page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  }
  res.render('urls_regis', templateVars);
});

// renders the login page 
app.get('/login', (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  }
  res.render("urls_login", templateVars);
});

// the delete button attached to specific short url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURLname = req.params.shortURL;
  delete urlDatabase[shortURLname];
  res.redirect('/urls');
});

// editing the short and long urls from the body
app.post('/urls/:shortURL', (req, res) => {
  const shortURLname = req.params.shortURL;
  const longURLname = req.body.longURL;
  const userID = req.session.user_id

  if (userID) {
    urlDatabase[shortURLname] = { longURL: longURLname, userID: userID };
    res.redirect('/urls');
  }
});

// add short and long urls to the list of urls 
app.post('/urls', (req, res) => {
  const randomDigits = generateRandomString();
  const userID = req.session.user_id;

  if (userID) {
    urlDatabase[randomDigits] = { longURL: req.body.longURL, userID: userID };
    res.redirect(`/urls/${randomDigits}`);
    console.log(urlDatabase);
  }
});

// captures email and password from the html body
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const userId = authenticateUser(users, email, password);

  if (!userId) {
    res.status(403).send("Email or Password don't match");
  } else {
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

// logout submission and clears cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// edit registration 
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  // no user or password input 
  if (email === "" || password === "") {
    res.status(400).send("Email or Password is empty");
    return;
  }

  // checks if email is in user database
  if (getUserByEmail(users, email) === true) {
    res.status(400).send("Email is already in the system!");
    return;
  }

  users[userID] = { id: userID, email, password: hashedPassword };

  req.session.user_id = userID;
  res.redirect('/urls');
});

// listen for server connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


