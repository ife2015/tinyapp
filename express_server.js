const express = require('express');
const cookieParser = require('cookie-parser');
const app = express(); 
const bodyParser = require("body-parser");
const PORT = 8080; 

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  let text = '';
  const alphaNumberic = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += alphaNumberic.charAt(Math.floor(Math.random()*alphaNumberic.length));
  }
  return text;
}

//generateRandomString(); 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
};

app.get("/", (request, response) => {
  response.send("Hello");
}); 

// add json -> we can send stringed objects
app.get("/urls.json", (request,response) => {
  response.json(urlDatabase);
});

app.get('/urls', (request,response) => {
  const templateVars = {
    username: users[request.cookies["user_id"]],
    urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request,response) => {
  const templateVars = { 
    username: users[request.cookies["user_id"]]
  }
  response.render('urls_new', templateVars);
});


app.post('/urls/:shortURL/delete', (request,response) => {
  const shortURLname = request.params.shortURL; 
  delete urlDatabase[shortURLname];
  response.redirect('/urls'); 
});

app.post('/urls/:shortURL', (request,response) => {
  const shortURLname = request.params.shortURL; 
  const longURLname = request.body.longURL; 
  urlDatabase[shortURLname] = longURLname ; 
  response.redirect('/urls'); 
});


app.post('/urls', (request, response) => {     
  const randomDigits = generateRandomString();
  urlDatabase[randomDigits] = request.body.longURL;
  response.redirect(`/urls/${randomDigits}`);
});  

app.post('/login', (request,response) => {
  const username = request.body.username; 
  response.cookie('username',username);
  response.redirect('/urls');
});

app.post('/logout', (request,response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});

app.post('/register', (request,response) => {
  const {email, password } = request.body;
  const userID = generateRandomString();
  users[userID] = {id:userID,email,password};
  response.cookie('user_id',userID);
  response.redirect('/urls');
});

// const users = {
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
// };

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { 
    username: users[request.cookies["user_id"]],
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL]};
    
  response.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL]; 
  response.redirect(longURL);
});

app.get('/register', (request, response) => {
  const templateVars = { 
    username: users[request.cookies["user_id"]]
  }
  response.render('urls_regis',templateVars);
});

// add html -> we can send html responses
app.get("/hello", (request,response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
});


