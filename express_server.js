const express = require('express');
const app = express(); 
const bodyParser = require("body-parser");
const PORT = 8080; 

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

app.get("/", (request, response) => {
  response.send("Hello");
}); 

// add json -> we can send stringed objects
app.get("/urls.json", (request,response) => {
  response.json(urlDatabase);
});

app.get('/urls', (request,response) => {
  const templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request,response) => {
  
  response.render('urls_new');
});

app.post("/urls", (request, response) => {
  console.log(request.body); 
  res.send("Ok");         
});

app.get("/urls/:shortURL", (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL]};
  response.render("urls_show", templateVars);
});

// add html -> we can send html responses
app.get("/hello", (request,response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
});


