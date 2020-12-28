const mongoose = require('mongoose');

const CertificateSchema=mongoose.Schema({
    name:{
        type:String, required:true, index:true
    },
    email:{
        type:String, required:true, lowercase:true
    },
    purpose:{
        type: String, required: true
    },
    organization:{
        type: String, required:true, index:true
    },
    details:{
        type: String, requied: true
    },
    start:{
        type: Date, required: true, default: Date.now
    },
    end:{
        type: Date, required: true, default: Date.now
    },
    issuedOn:{
        type: Date, requied: true, default: Date.now
    }
},{
    timestamps:true
});



module.exports = mongoose.model('Certificate',CertificateSchema);