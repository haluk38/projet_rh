const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "le nom est requis"],
    },
    siret: {
        type: Number,
        required: [true, "un siret est requis"],
    },
    mail: {
        type: String,
        required: [true, "le mail est requis"],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/g.test(v)
            },
            message: "Entrez un mail valide"
        }
    },
    business: {
        type: String,
        required: [true, "le nom de l'entreprise est requis"],
    },
    password: {
        type: String,
        required: [true, "le mot de passe est requis"],
    },
    employes: {
        type: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "employes"
            }
        ]
    }
});

// userSchema.pre("validate", async function (next) {
//     try {
//         // verifiez si l'email est unique
//         const existinuser = await this.construtor.findOne({mail: this.mail})
//         if(existingUser){
//             this.invalidate("email", "cet email est déjà enregistré"); // methode invalidate qui permet de generer une erreur de valadation
//         }
//         next()
//     } catch (error) {
//         next(error);
//     }
// });

userSchema.pre("save", function (next){
    if (!this.isModified("password")) {
        return next();
    }
    bcrypt.hash(this.password, 10, (error, hash) =>{
        if (error) {
            return next(error);
        } 
        this.password = hash;
        next()
    });
});

const userModel = mongoose.model('users', userSchema)
module.exports = userModel