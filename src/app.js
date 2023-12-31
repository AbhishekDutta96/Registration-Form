require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("../src/db/conn");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views",template_path);

hbs.registerPartials(partials_path);

app.get("/",(req, res) => {
    res.render("index");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");
})

// create a new user in our database
app.post("/register", async (req, res) =>{
    try{
        const password = req.body.password;
        const confpassword = req.body.confirmpassword;
        if(password === confpassword){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                password : req.body.password,
                phone : req.body.phone,
                confirmpassword : req.body.confirmpassword,
                age : req.body.age,
            })

            // password hash 

            const token = await registerEmployee.generateAuthToken();

            const registered = await registerEmployee.save();
            res.status(201).render("index");
        }else{
            res.send("Passwords are not matching")
        }
    }catch(e){
        res.status(400).send(e);
    }
})

// login post

app.post("/login", async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();

        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid login details");
        }
    }catch(err){
        res.status(400).send("invalid login details");
    }
})

app.listen(port, () => {
    console.log(`Server is successfully connected to port ${port}`);
})