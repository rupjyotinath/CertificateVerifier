const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userController');
const passport = require('passport');
const {loginRequired} = require('../middlewares');

router.get('/register', async (req,res)=>{
    try{
        const checkUserExists = await userControllers.anyUserExists();
        if(checkUserExists){
            req.flash('error','User already registered')
            res.redirect('/');
        }
        else{
            res.locals.pageHeading='Register';
            res.render('user/register');
        }
    }
    catch(err){
        res.status(500).send('Internal Server Error');
    }
})

router.post('/register', async (req,res,next)=>{
    const data = req.body;
    try{
        const registeredUser = await userControllers.register(data);
        return res.status(200).send('Registration Successful');

    }
    catch(err){
        if(err.message.indexOf('already registered')){
            err.http_status=400;
        }
        return next(err);

    }
});

router.get('/login', (req,res)=>{
    // console.log(req.session.flash);
    if(req.user) return res.redirect('/');
    res.locals.pageHeading='Login';
    res.render('user/login',{error: req.flash('error')});
});

router.post('/login',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}));

router.get('/logout',loginRequired,(req,res)=>{
    res.locals.pageHeading='Logout';
    res.render('user/logout');
});

router.post('/logout',loginRequired,(req,res)=>{
    req.logout();
    return res.redirect('/');
})

module.exports = router;