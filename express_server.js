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
};

const lookupEmails = function(userDatabase,useremail) {
  for(let id in userDatabase) {
    if(users[id].email === useremail) {
      return true;
    }
  }
}; 

//generateRandomString(); 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

const users = {
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
    user_id: users[request.cookies["user_id"]],
    urls: urlDatabase };
  response.render('urls_index', templateVars);
});

// page for entering new urls 
app.get('/urls/new', (request,response) => {
  const templateVars = { 
    user_id: users[request.cookies["user_id"]]
  }
  response.render('urls_new', templateVars);
});

// shows the new short url linked to the long url
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { 
    user_id: users[request.cookies["user_id"]],
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL]};
    
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
      user_id: users[request.cookies["user_id"]]
    }
    response.render('urls_regis',templateVars);
  });
  
  app.get('/login', (request, response) => {
    const templateVars = { 
      user_id: users[request.cookies["user_id"]]
    }
    response.render("urls_login", templateVars);
  })


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

// reads the short and long urls from the body
app.post('/urls/:shortURL', (request,response) => {
  const shortURLname = request.params.shortURL; 
  const longURLname = request.body.longURL; 
  urlDatabase[shortURLname] = longURLname ; 
  response.redirect('/urls'); 
});

// add short and long urls to the list of urls 
app.post('/urls', (request, response) => {     
  const randomDigits = generateRandomString();
  urlDatabase[randomDigits] = request.body.longURL;
  response.redirect(`/urls/${randomDigits}`);
});  

// edit login 
app.post('/login', (request,response) => {
  const {email, password } = request.body;
// check if the email is in the users
// check if for that email the password matches
// if everything true, grab user object in users
// set the cookie to that user ID 

  for(let user in users) {
    if(email === users[user].email) {
      if(password === users[user].password) {
          response.cookie('user_id', user);
          response.redirect('/urls'); 
      }
    } else {
      response.status(403).send("Email or Password don't match"); 
    }
   }
   response.status(403).send("Your email was not found!"); 

});

// edit logout
app.post('/logout', (request,response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

// edit registration 
app.post('/register', (request,response) => {
  const {email, password } = request.body;
  const userID = generateRandomString();
  
  if(email === "" || password === "") {
    response.status(400).send("Email or Password is empty");
    return;
  } 
  
  if (lookupEmails(users,email) === true) {
   response.status(400).send("Email is already in the system!");
   return;
  }
    users[userID] = {id:userID,email,password};
    console.log(users);
    response.cookie('user_id',userID);
    response.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
});


