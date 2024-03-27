const employeRouter = require('express').Router();
const employeModel = require("../models/employeModel.js");
const session = require('express-session');
const bcrypt = require("bcrypt");
const authguard = require('../services/authguard.js');
const multer = require('../services/multer-config.js');
const userModel = require('../models/userModel.js');
const fs = require('fs');


//ROUTE POUR AFFICHER MON DASHBOARD AVEC LES EMPLOYE
employeRouter.get('/dashboardPage',authguard, async (req,res) =>{
    try {
        let employeQuery = {}; // Initialiser la requête de recherche

        // Vérifier si le paramètre de requête 'search' est présent
        if (req.query.search) {
            // Si oui, configurer la requête de recherche pour le nom d'employé
            employeQuery = { name: { $regex: new RegExp(req.query.search, 'i') } };
        }
        const employe = await userModel.findOne({_id: req.session.user}).populate({
            path: "employes",
            match: employeQuery 
            
        })// afficher les employées
        res.render('Dashboard/dashboardPage.twig', {   
            employes : employe.employes,
            'route': '/dashboardPage',
        })
    } catch (error) {
        res.send(error)
        console.log(error);
    }
})
//ROUTE POUR LA DÉCONNEXION
employeRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/loginPage'); // Redirige vers la page de connexion après la déconnexion
    });
});
//ROUTE POUR CREE UN EMPLOYE
employeRouter.post('/dashboardPage', authguard, multer.single('image') , async (req,res) =>{
    try{
        console.log(req.session.user);
        const employe = new employeModel(req.body) // creation de l'employer
        if (req.file) {
            if(req.multerError) {
                throw{errorUpload:"le fichier n'est pas valide"}
            }
            employe.image = req.file.filename
        }
        employe.validateSync()
        await employe.save() //sauvegarde en DB
        await userModel.updateOne({_id: req.session.user},{$push: {employes: employe._id}});
        res.redirect("/dashboardPage") // redirection vers dashboard si pas d'erreur de validation
    }catch (error) {
        console.log(error);
        res.render('Dashboard/dashboardPage.twig')
    }
})
//ROUTE POUR SUPPRIMER UN EMPLOYE
employeRouter.get('/deleteEmploye/:employeid', authguard, async(req,res) =>{
    try {
        const employe = await employeModel.findById({ _id: req.params.employeid})
        //supprimer l'employé de la base des données
        await employeModel.deleteOne ({_id: req.params.employeid})
        fs.unlink('assets/images/uploads/' + employe.image, (error) => {
            if(error) throw error;
        })
        // Supprimer la référence de l'employé dans le modèle utilisateur
        await userModel.updateOne({_id: req.session.user},{$pull: { employes: req.params.employeid}})
        res.redirect("/dashboardPage")
        
    } catch (error) {
        res.render('Dashboard/dashboardPage.twig')
    }
})
//ROUTE POUR BLAMER UN EMPLOYE
employeRouter.get('/blameEmploye/:employeid', authguard, async (req, res) => {
    try {
        const employe = await employeModel.findById(req.params.employeid);

        if (!employe) {
            return res.status(404).send("Employé non trouvé");
        }

        // Incrémenter le nombre de blâmes pour l'employé
        employe.blame = (employe.blame || 0) + 1;
        await employe.save();

        // Vérifier si l'employé a reçu trois blâmes
        if (employe.blame >= 3) {
            // Si oui, supprimer l'employé
            await employeModel.deleteOne({_id: req.params.employeid});
            await userModel.updateOne({_id: req.session.user}, {$pull: {employes: req.params.employeid}});
            res.redirect("/dashboardPage");
        } else {
            res.redirect("/dashboardPage"); // Redirection vers la page du tableau de bord
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Une erreur est survenue lors du blâme de l'employé");
    }
});
//ROUTE POUR AFFICHER LA PAGE MODIFIER UN EMPLOYE
employeRouter.get('/updateEmploye/:employeid', authguard, async (req,res) =>{
    try{
        const employe = await employeModel.findById(req.params.employeid);
        if(!employe){
            throw {error: "employer introuvable"}
        }
        res.render("Dashboard/updateForm.twig",{
            employe:employe
        })
        }catch (error) {
            res.render("Dashboard/dashboardPage.twig")
        }
})
// ROUTE POUR MODIFIER UN EMPLOYE
employeRouter.post('/updateEmploye/:employeid', authguard, multer.single('image'), async(req,res) =>{
    try {
        if (req.file) {
            if(req.multerError){
                throw{errorUpload:"le fichier n'est pas valide"}
            }
            req.body.image = req.file.filename
        }
        await employeModel.updateOne({_id: req.params.employeid}, req.body);
        res.redirect("/dashboardPage");
    } catch (error) {
        res.render('dashboard/dashboardPage.twig')
    }
})




module.exports = employeRouter