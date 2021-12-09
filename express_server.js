const { request } = require('express');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 4040;






const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

/** DATABASE */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/** MIDDLEWARE */
//use bodyParser to handle post request
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/** TEMPLATE */
//set the view engine to ejs
app.set("view engine", "ejs");


/** TEST */
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/** ROUTE */
/** main page */
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


/** login */
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

/** logout */
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})
  

/** add a new URL */
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// Register accounts
app.get("/register", (req, res) => {
    let templateVars = { username: null };
    res.render("register", templateVars);
  });

app.post("/urls", (req, res) => {
  //console.log(req.body);
  //add new key-value into urlDatabase
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //res.redirect('path'), don't use ':'
  res.redirect(`/urls/${shortURL}`);
});



app.post("/urls/:shortURL/delete", (req, res) => { /** delete URL */
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => { /** edit URL */
  const newLongURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
})


/*** short URL result & hyperlink ***/
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies['username']
  }
  res.render("urls_show", templateVars);
});

/*** redirect to longURL ***/

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL)
  res.redirect(`${longURL}`);
});




/*** SET UP ***/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

/**** FUNCTION ****/
function generateRandomString() {
  let randomString = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString.push(letters[Math.floor(Math.random() * letters.length)]);
  }
  return randomString.join('');
};