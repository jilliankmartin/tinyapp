const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const randomString = require("randomstring");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {};

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

const urlsForUser = (urlsDB, id) => {
  const filterUrls = {};
  for (const shortURL in urlsDB) {
    const urlObj = urlsDB[shortURL];
    if (urlObj.userID === id) {
      filterUrls[shortURL] = urlObj;
    }
  }
  return filterUrls;
}

app.get("/", (req, res) => {
  res.redirect(`/urls`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//>>>>
app.get("/urls", (req, res) => {
  if (req.cookies.id) {
  const userSpecificUrls = urlsForUser(urlDatabase, req.cookies.id);
  const templateVars = { urls: userSpecificUrls, user: users[req.cookies["id"]] };
  res.render("urls_index", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.id){
  const templateVars = { urls: urlDatabase, user: users[req.cookies["id"]] };
  res.render("urls_new", templateVars);
  }
  else {
    res.redirect(`/login`);
  }
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
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["id"]};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.id){
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
  const userSpecificUrls = urlsForUser(urlDatabase, req.cookies.id);
  const usersShortUrls = Object.keys(userSpecificUrls)
  if  (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404).send('Sorry, that URL does not exist');
  } else if (!req.cookies.id || !usersShortUrls.includes(req.params.shortURL)) {
    res.status(401).send('Sorry, you do not have permission to view this page');
  } else {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["id"]] };
  res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});