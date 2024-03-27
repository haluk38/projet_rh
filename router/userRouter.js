const userRouter = require('express').Router();
const userModel = require("../models/userModel.js");
const employeModel = require("../models/employeModel.js");
const bcrypt = require("bcrypt")
const authguard = require('../services/authguard.js')

//AFFICHER MA PAGE ADMIN
userRouter.get('/home_page', (req, res) => {
    try {
        res.render("home/homePage.twig", {
            'route': '/home_page'
        })
    } catch (error) {
        res.send(error)
    }
})
//AFFICHER MA PAGE CREE UNE ENTREPRISE
userRouter.get('/addFormPage',(req,res) => {
    try {
        res.render("home/addFormPage.twig",{
            'route': '/addFormPage'
        })
    } catch (error) {
        res.send(error)
    }
})
//CREE UNE ENTREPRISE
userRouter.post("/addFormPage", async (req,res) =>{
    try {
        const user = new userModel(req.body);
        user.validateSync()
        await user.save();
        res.redirect('/loginPage')
    } catch (error) {
        res.render('home/addFormPage.twig',{
                error: error.errors
        })
    }
})
//AFFICHER MA PAGE CONNEXION
userRouter.get('/loginPage', (req,res)=>{
    res.render('home/loginPage.twig')
})
//CONNECXION A LA PAGE DASHBOARD
userRouter.post('/loginPage', async (req,res) => {
    try {
        let user = await userModel.findOne({mail: req.body.mail})
        if(user){
            console.log(user);
            if(bcrypt.compare(req.body.password, user.password)) {
                req.session.user = user._id
                console.log(req.session.user);
                res.redirect('/dashboardPage')
            } else {
                throw { password : "Mauvais mot de passe"}
            }
        } else {
            throw { mail : "cet utilisateur n'est pas enregistrer"}
        }
    } catch (error) {
        res.render('home/loginPage.twig', {
            error: error.errors
        })
    }
})



module.exports = userRouter