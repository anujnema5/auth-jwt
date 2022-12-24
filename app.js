const { hashSync, compareSync } = require('bcrypt');
const express = require('express');
const app = express();
const UserModel = require('./config/database');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('./config/passport');


app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());


app.use(passport.initialize())

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post("/login",(req,res)=>{
    UserModel.findOne({username : req.body.username}).then((user)=>{
        if(!user) {
            return res.status(404).send({
                success : false,
                message : "Could not find the user"
            })
        }
        
        if(!compareSync(req.body.password, user.password)) {
            return res.status(404).send({
                success : false,
                message : "Password do not match"
            })
        }

        if(user) {
        const payload = {
            username : user.username,
            id : user._id
        }
        const token = jwt.sign(payload, "secretOrPrivateKey", {expiresIn : '1d'});

        return res.status(200).send({
            success : true,
            message : "Logged in successfully",
            token : "Bearer " + token
        })
    }
    })
})

app.post('/register', (req, res) => {
    let user = new UserModel({
        username: req.body.username,
        password: hashSync(req.body.password, 10)
    })

    user.save().then(user => {
        res.send({
        success : true,
        message : "User created",
        user : {
            id : user._id,
            username : user.username
        }
    })

    }).catch((err)=>res.send({
        success : false,
        message : "Sorry :(",
        user : {
            message : "No user created"
        }
    }));

});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
})

app.get('/protected', passport.authenticate('jwt', {session : false}), (req,res)=>{
    return res.status(200).send({
        success : true,
        user : {
            id : req.user.id,
            password : req.user.password
        }
    })
});

app.listen(5000, (req, res) => {
    console.log("Listening to port 5000");
})