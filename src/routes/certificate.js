const express = require('express');
const router = express.Router();
const certificateControllers = require('../controllers/certificate');
const sendToQueue= require('../controllers/messageQueue');
const {loginRequired} = require('../middlewares');

router.get('/',(req,res)=>{
    res.locals.pageHeading='Verify';
    res.render('certificate/verify',{error:req.flash('error')});
})

router.get('/verify',(req,res)=>{
    const id=req.query['certificate-id'];
    res.redirect(`/certificates/${id}`);
})

router.get('/certificates/new',loginRequired,(req,res)=>{
    res.locals.pageHeading='Issue Certificate';
    res.render('certificate/add');
})

router.post('/certificates',loginRequired,async (req,res,next)=>{
    console.log(req.body);
    /*
    Handle start & end date being empty string
    */
    if(req.body.hasOwnProperty('start')){
        if(!req.body.start){
            delete req.body.start;
        }
    }
    if(req.body.hasOwnProperty('end')){
        if(!req.body.end){
            delete req.body.end;
        }
    }
    console.log(req.body);
    let issuedCertificate=null;
    try{
        console.time('issue');
        issuedCertificate=await certificateControllers.issueCertificate(req.body);
        console.timeEnd('issue');

        // Add to queue
        console.time('queue');
        const q= await sendToQueue(issuedCertificate);
        console.log(q);
        console.log(q.MessageId);
        console.timeEnd('queue');
        res.redirect('/certificates/'+issuedCertificate._id);
    }
    catch(err){
        if(issuedCertificate._id){
            req.flash('error',err.message);
            return res.redirect('/certificates/'+issuedCertificate._id);

        }
        else
            return next(err);
    }
    
})

router.get('/certificates/:id',async (req,res,next)=>{
    const id=req.params.id;
    try{
        const certificate=await certificateControllers.getCertificate(id);
        res.locals.pageHeading=certificate.name;
        res.render('certificate/show',{certificate:certificate,error:req.flash('error')});
    }
    catch(err){
        if(err.message.indexOf('Certificate Not Found')!=-1){
            req.flash('error','Invalid Certificate ID');
            return res.redirect('/');
        }
        else{
            return next(err);
        }

    }
})

router.put('/certificates/:id',loginRequired, async (req,res)=>{
    const id=req.params.id;
    /*
    Handle start & end date being empty string
    */
    if(req.body.hasOwnProperty('start')){
        if(!req.body.start){
            delete req.body.start;
        }
    }
    if(req.body.hasOwnProperty('end')){
        if(!req.body.end){
            delete req.body.end;
        }
    }
    try{
        const certificate=await certificateControllers.updateCertificate(id,req.body);
        res.redirect('/certificates/'+id);
    }
    catch(err){
        console.log(err);
        if(err.message.indexOf('Certificate Not Found')!=-1){
            res.status(404).send(err.message);
        }
        else{
            res.status(500).send("Internal Server Error");
        }

    }
})

router.get('/certificates/:id/edit',loginRequired,async (req,res,next)=>{
    const id=req.params.id;
    try{
        const certificate=await certificateControllers.getCertificate(id);
        res.locals.pageHeading=certificate.name+' | Edit';
        res.render('certificate/edit',{certificate});
    }
    catch(err){
        if(err.message.indexOf('Certificate Not Found')!=-1){
            err.status = 404;
            return next(err);
        }
        else{
            return next(err);
        }
    }
});

module.exports = router;