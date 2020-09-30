const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const randomString = require("randomstring");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const generateRandomString = function(characters) {
  return randomString.generate(characters);
};

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

app.get("/", (req, res) => {
  res.redirect(`/urls`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["id"]] };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["id"]]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["id"]] };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});
///////>
app.post("/login", (req, res) => {
  const ID = IDLookup(users, req.body.email)
  if (!emailLookup(users, req.body.email)) {
    res.status(403).send('Sorry, that email does not exist');
  } else if (users[ID].password !== req.body.password) {
    res.status(403).send('Please enter a valid email and password');
  } else {
    const cookie = IDLookup(users, req.body.email);
    res.cookie("id", cookie);
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const email = req.body.email
  const ID = generateRandomString(5) //This isn't enterprise level software. 5 characters should be enough.
  const password = req.body.password
  if (email === "" || password === "" || emailLookup(users, email) === email) {
    res.status(400).send('Please enter a valid email and password');
  } else {
  users[ID] = {ID, email, password};
  res.cookie("id", ID);
  res.redirect(`/urls`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["id"]] };
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.render("urls_does_not_exist", templateVars);
  }
  if (!urlDatabase[req.params.shortURL].includes("https://") && !urlDatabase[req.params.shortURL].includes("http://")) { //This functionality designed to handle a situation where a user enters a URL without the http prefix. Not perfect because it can only append for a secure connection but as most sites are secure these days I've left it at that.
    urlDatabase[req.params.shortURL] = "https://" + urlDatabase[req.params.shortURL];
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