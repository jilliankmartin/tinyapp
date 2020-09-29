const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var randomString = require("randomstring");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

 const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
 };

 function generateRandomString() {
  return randomString.generate(6);
 }

 app.get("/", (req, res) => {
   res.send("Hello!");
 });

 app.get("/urls.json", (req, res) => {
   res.json(urlDatabase);
 });

 app.get("/hello", (req, res) => {
   res.send("<html><body>Hello <b>World</b></body></html>\n");
 });

 app.get("/urls", (req, res) => {
   const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
   console.log(templateVars.username);
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});



app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const cookie = req.body.username
  res.cookie("username", cookie)
  res.redirect(`/urls`);
});
//
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.render("urls_does_not_exist", templateVars);
  }
  if (!urlDatabase[req.params.shortURL].includes("https://")) {
    urlDatabase[req.params.shortURL] = "https://" + urlDatabase[req.params.shortURL]
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

 app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
 });