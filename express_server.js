const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { emailLookup, IDLookup, urlsForUser, generateRandomString } = require('./helpers');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['supersecretkeythatwouldnormallynotbeintheserverfile', 'oopsanotherkeythatistechnicallyexposedandshouldntbeandwontbeinfuture'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");

const urlDatabase = {};

const users = {};

app.get("/", (req, res) => {
  if (req.session.id) {
    res.redirect(`/urls`);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (req.session.id) {
    const userSpecificUrls = urlsForUser(urlDatabase, req.session.id);
    const templateVars = { urls: userSpecificUrls, user: users[req.session["id"]] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect(`urls/mustlogin`);
  }
});

app.get("/urls/mustlogin", (req, res) => {
  const userSpecificUrls = urlsForUser(urlDatabase, req.session.id);
  const templateVars = { urls: userSpecificUrls, user: users[req.session["id"]] };
  res.render("must_log_in", templateVars);
});

app.get("/doesnotexist", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, user: users[req.session["id"]] };
  res.render("does_not_exist", templateVars);
});

app.get("/invalidlogin", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, user: users[req.session["id"]] };
  res.render("invalid_login", templateVars);
});

app.get("/invalidregistration", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, user: users[req.session["id"]] };
  res.render("invalid_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.id) {
    const templateVars = { urls: urlDatabase, user: users[req.session["id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/register", (req, res) => {
  if (req.session.id) {
    res.redirect(`/urls`);
  }
  const templateVars = { user: users[req.session["id"]]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.id) {
    res.redirect(`/urls`);
  }
  const templateVars = { user: users[req.session["id"]] };
  res.render("login", templateVars);
});

app.get("/urls/:shortURL/delete", (req, res) => {
  if (req.session.id) {
    res.redirect(`/urls`);
  }
  res.redirect(`/urls/mustlogin`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["id"]};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(401).send('Sorry, you do not have permission to do that');
    console.log("Attempted command line deletion was blocked");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const ID = IDLookup(users, req.body.email);
  if (!emailLookup(users, req.body.email)) {
    res.redirect(`/invalidlogin`);
  } else if (!bcrypt.compareSync(req.body.password, users[ID].password)) {
    res.redirect(`/invalidlogin`);
  } else {
    req.session.id = ID;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const ID = generateRandomString(5); //This isn't enterprise level software. 5 characters should be enough.
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "" || emailLookup(users, email) === email) {
    res.redirect(`/invalidregistration`);
  } else {
    users[ID] = {ID, email, password: hashedPassword};
    req.session.id = ID;
    res.redirect(`/urls`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userSpecificUrls = urlsForUser(urlDatabase, req.session.id);
  const usersShortUrls = Object.keys(userSpecificUrls);
  if  (urlDatabase[req.params.shortURL] === undefined) {
    res.redirect(`/doesnotexist`);
  } else if (!req.session.id || !usersShortUrls.includes(req.params.shortURL)) {
    res.redirect(`/urls/mustlogin`);
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["id"]] };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.redirect(`/doesnotexist`);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});