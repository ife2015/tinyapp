const findUserByEmail = require('./helpers.js');
const express = require('express');
const cookieSession = require('cookie-session');
const app = express(); 
const bodyParser = require("body-parser");
const PORT = 8080; 
const bcrypt = require('bcrypt'); 

app.set('view engine', 'ejs');
app.use(cookieSession({name:'session',keys:['key1','key2']}));

app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  let text = '';
  const alphaNumberic = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += alphaNumberic.charAt(Math.floor(Math.random()*alphaNumberic.length));
  }
  return text;
};

const urlsForUser = function (id) {
  let urlsData = {};
  for (let user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      urlsData[user] = urlDatabase[user].longURL;
    }
  }
  return urlsData;
};

//generateRandomString(); 
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
}; 

const users = {
  'aJ48lW': {id: 'aJ48lW', email:"ifemastero@yahoo.com", password:"zxc" } 
};

// const findUserByEmail = function(userDatabase, useremail) {
//   for (let userId in userDatabase) {
//     if (useremail === userDatabase[userId].email) { 
//       return users[userId];
//     }
//   }
//   return false; 
// };

const authenticateUser = function(userDatabase, email, password) {
  const user = findUserByEmail(userDatabase, email); 
  
  if(user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false; 
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
    user_id: users[request.session.user_id], 
    urls: urlsForUser(request.session.user_id), 
  };

  //CHECKs usersId in urldatabase and compares to userlogin
  if (request.session.user_id === undefined) {
    //login 
    response.redirect('/login');
  } else {
    response.render('urls_index', templateVars);
  }
});


// page for entering new urls 
app.get('/urls/new', (request,response) => {
  const templateVars = { 
    user_id: users[request.session.user_id]
  } 

  if (request.session.user_id === undefined) {
    response.redirect('/login');
  } else {
    response.render('urls_new', templateVars); 
  }
});

// shows the new short url linked to the long url
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { 
    user_id: request.session.user_id,
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL].longURL,
    urlUserId: urlDatabase[request.params.shortURL].userID
  };
  
    response.render('urls_show', templateVars);
  });

  // short url link is redirected to the long url
  app.get('/u/:shortURL', (request, response) => {
    const longURL = urlDatabase[request.params.shortURL]; 
    response.redirect(longURL);
  });
  
  // register page
  app.get('/register', (request, response) => {
    const templateVars = { 
      user_id: users[request.session.user_id]
    }
    response.render('urls_regis',templateVars);
  });
  
  app.get('/login', (request, response) => {
    const templateVars = { 
      user_id: users[request.session.user_id]
    }
    response.render("urls_login", templateVars);
  });

  // add html -> we can send html responses
  app.get("/hello", (request,response) => {
    response.send('<html><body>Hello <b>World</b></body></html>\n');
  });


// the delete button
app.post('/urls/:shortURL/delete', (request,response) => {
  const shortURLname = request.params.shortURL; 
  delete urlDatabase[shortURLname];
  response.redirect('/urls'); 
});

// editing the short and long urls from the body
app.post('/urls/:shortURL', (request,response) => {
  const shortURLname = request.params.shortURL; 
  const longURLname = request.body.longURL; 
  const userID = request.session.user_id
  
  if(userID) {
    urlDatabase[shortURLname] = {longURL: longURLname, userID:userID }; 
    response.redirect('/urls');
  } 
  
});

// add short and long urls to the list of urls 
app.post('/urls', (request, response) => {     
  const randomDigits = generateRandomString();
  const userID = request.session.user_id;

  if(userID) {
    urlDatabase[randomDigits] = {longURL: request.body.longURL, userID:userID };
    response.redirect(`/urls/${randomDigits}`);
    console.log(urlDatabase);
  }
});  


// edit login 
app.post('/login', (request, response) => {
  const { email, password } = request.body;
  console.log(request.body);

  const userId = authenticateUser(users,email,password); 

  if(!userId) {
    response.status(403).send("Email or Password don't match");
  } else {
    request.session.user_id = userId;
    response.redirect('/urls');
  }
});


// edit logout
app.post('/logout', (request,response) => {
  request.session = null; 

  response.redirect('/urls');
});


// edit registration 
app.post('/register', (request, response) => {
  const { email, password } = request.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();


  if (email === "" || password === "") {
    response.status(400).send("Email or Password is empty");
    return;
  }

  if (findUserByEmail(users, email) === true) {
    response.status(400).send("Email is already in the system!");
    return;
  }
  users[userID] = { id: userID, email, password:hashedPassword};
  console.log(users);
  request.session.user_id = userID;
  response.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
});


