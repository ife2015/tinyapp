const express = require('express');
const app = express(); 
const PORT = 8080; 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

app.get("/", (request, response) => {
  response.send("Hello");
}); 

// add json
app.get("/urls.json", (request,response) => {
  response.json(urlDatabase);
});

// add html
app.get("/hello", (request,response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
});
