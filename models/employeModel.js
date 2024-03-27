const mongoose = require("mongoose");

const employeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Le Nom est requis"],
    },
    fonction: {
        type: String,
        required: [true, "une fonction est requise",]
    },
    blame: {
        type: Number,
        required: [true, "nombre de blame est requis",],
        default: 0
    },
    image: {
        type: String,
        default:""
    },
})

const employeModel = mongoose.model('employes', employeSchema)
module.exports = employeModel