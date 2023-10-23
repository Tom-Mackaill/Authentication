import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
//New import enabling encryption
import encryption from "mongoose-encryption";


const app = express();
const port = 3000;



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB")
//Change to the normal schema which allows for encryption
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});
//This is used to encrypt data
const secret = "Thisisourlittlesecret.";
//Adding the encryption plugin onto the schema 
//Secret is used to encrypt and password is the field to encrypt
//process.env refers to a seperate .env file where the secret is found.
//This allows extra security when using it with gitignore to other people cant see data/
userSchema.plugin(encryption, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});


app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save();
    res.render("secrets");
});
//Basic authentication on the login route
//username and password from user input is stored
//User.findOne looks through DB and checks the username from user input 
// --against the email field which was created with Schema
//If a match is found then it checks the foundUser password 
// --against user input password
//If it checks out then we render seceret page, 
// --if not then the home page is rendered
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then((foundUser) => {
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets")
            }
        } else {
            res.render("home")
        }
    });
});




app.listen(port, function() {
    console.log("Server started on port 3000");
  });
  