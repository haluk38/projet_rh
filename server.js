const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const cors = require('cors')
const userRouter = require("./router/userRouter");
const employeRouter = require("./router/employeRouter");

const app = express();

app.use(express.json())
app.use(cors())
app.use(express.static("./assets"))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret:'votre_secret_key',
    resave: true,
    saveUninitialized: true,
}))

app.use(userRouter);
app.use(employeRouter)



app.listen(3000 ,(err)=>{
    console.log(err ? err : "connecter au server");
});

mongoose.connect("mongodb://localhost:27017/projet_rh")