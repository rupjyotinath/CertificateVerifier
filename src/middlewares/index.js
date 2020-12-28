// Set user for views
const setUser = (req,res,next)=>{
    res.locals.user=req.user;
    return next();
};

// Middleware for loginRequired
const loginRequired = (req,res,next)=>{
    if(req.user) return next();
    return res.redirect('/login');
};

// Error Handling Middleware
const error_handler = (error,req,res,next)=>{
    if(!error.status)
        res.locals.message = 'Internal Server Error';
    else
        res.locals.message = error.message;
    const status = error.status || 500;
    res.locals.http_status = status;

    res.status(status);
    res.render('error');
}

module.exports={
    setUser,
    loginRequired,
    error_handler
}