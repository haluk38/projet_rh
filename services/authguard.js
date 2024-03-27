const userModel = require('../models/userModel')

const authguard = async (req, res, next) => {
    try {
        if (req.session.user){
            let user = await userModel.findOne({_id: req.session.user });
            if (user){
                return next();
            }
    } 
    throw new Error("utilisateur non connecté");
}catch (error) {
    console.log(error);
        res.redirect('/loginPage'); // Redirige vers page login
    }
}

module.exports = authguard