const mongoose = require('mongoose');
const Certificate = require('../models/certificate');

const issueCertificate = async (data)=>{
    try{
        const certificate=new Certificate(data);
        const issuedCertificate = await certificate.save();
        if(issuedCertificate){
            console.log("Certificate Issued Successfully, ID: ", issuedCertificate._id);
            return issuedCertificate;
        }
        else{
            throw new Error('Empty object returned while generating certificate');
        }
    }
    catch(err){
        console.log(err);
        throw new Error('Unable to issue certificate');
    }
}

const getCertificate = async (id)=>{
    try{
        const certificate=await Certificate.findById(id);
        if(certificate){
            console.log("Certificate found");
            console.log(certificate);
            return certificate;
        }
        else{
            throw new Error('Certificate Not Found, Invalid ID');
        }
    }
    catch(err){
        throw err;
    }
}

const updateCertificate = async (id, data)=>{
    try{
        const certificate=await getCertificate(id);
        Object.keys(data).forEach(key=>{
            certificate[key]=data[key];
        })

        const updatedCertificate = await certificate.save();
        if(updatedCertificate){
            return updateCertificate;
        }
        else{
            throw new Error('Unable to save the updated document');
        }
    }
    catch(err){
        throw err;
    }
}


module.exports={
    issueCertificate,
    getCertificate,
    updateCertificate
}