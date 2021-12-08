
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 4040; //default port 8080
app.use(bodyParser.urlencoded({extended: true}));



app.set("view engine", "ejs");

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };




 
app.get("/", (req, res) => { //curl -L http://localhost:4040/u/b2xVn2
    res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  //////////////////////////////////
  app.post("/urls", (req, res) => {
    const longURL = req.body.longURL;
    console.log(req.body)
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = longURL;
    res.redirect("/u/"+shortURL);        
  });
  
  app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls")
  })
  
  app.post("/urls/:shortURL", (req, res) => {
    const longURL = req.body.longURL;
    shortURL = req.params.shortURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls")
  })


  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});


  function generateRandomString() {
    let output = '';
    let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for ( var i = 0; i < 6; i++ ) {
        output += alpha.charAt(Math.floor(Math.random() * 
   6));
     }
     return output;
  }
  