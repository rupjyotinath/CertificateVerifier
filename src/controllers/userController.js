const mongoose = require('mongoose');
const UserModel = require('../models/userModel');

const findAuthenticatedUser = async (email,password)=>{
    try{
        const authenticatedUser={};
        const user = await UserModel.findOne({email:email}).exec();
        authenticatedUser.user=user;
        if(!user) return authenticatedUser;
        const passwordOk = await user.comparePassword(password);
        authenticatedUser.passwordOk=passwordOk;
        return authenticatedUser;
    }
    catch(err){
        throw err;
    }
}

const findUserById = async (id)=>{
    try{
        const user = await UserModel.findById(id).exec();
        if(user)
            return user;
        else throw new Error('No user found');
    }
    catch(err){
        throw err;
    }
}

const anyUserExists = async ()=>{
    try{
        const user = await UserModel.findOne({}).exec();
        if(user){
            return true;
        }
        else return false;
    }
    catch(err){
        throw err;
    }
}

const register = async (data)=>{
    try{
        const anyUser = await anyUserExists();
        if(anyUser){
            throw new Error('A user is already registered');
        }
        const User = new UserModel(data);
        const savedUser = await User.save();
        if(savedUser) return savedUser;
        else{
            throw new Error('User could not be saved');
        }
    }
    catch(err){
        throw err;
    }
}

module.exports = {
    anyUserExists,
    register,
    findAuthenticatedUser,
    findUserById
}