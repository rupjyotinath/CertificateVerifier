const express = require('express');
const mongoose  = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userControllers = require('./controllers/userController');
const certificateRoutes = require('./routes/certificate');
const userRoutes = require('./routes/user');
const middlewares = require('./middlewares');
const flash = require('connect-flash');


const result=require('dotenv').config()
if(result.error){
    throw result.error;
}

// Database Connection
mongoose.connect(process.env.DB_CONNECTION_STRING,{
    useNewUrlParser:true, useUnifiedTopology:true,
})
.then(()=>{
    console.log('Connected to Database Successfully')
})
.catch(err=>{
    console.log('Error in Database Connection: '+err.message);
    process.exit(1);
});



const app=express();

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'./views'));

app.use(flash());

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection:mongoose.connection}),
}));

/*****************
 * Passport Setup
 *****************/
app.use(passport.initialize());
app.use(passport.session());

// Serializing & deserializing users
passport.serializeUser((user,done)=>{
    console.log(user._id);
    return done(null,user._id);
});
passport.deserializeUser(async (id,done)=>{
    try{
        const user = await userControllers.findUserById(id);
        return done(null,user);
    }
    catch(err){
        return done(err);
    }
});

// Use local strategy, i.e. username & password saved in database
passport.use(new LocalStrategy({usernameField:'email'},async (username,password,done)=>{
    try{
        const authenticatedUser=await userControllers.findAuthenticatedUser(username,password);
        if(!authenticatedUser.user){
            return done(null,false,{message:'Invalid Username or Password'});
        }
        if(!authenticatedUser.passwordOk){
            return done(null,false,{message:'Invalid Username or Password'});
        }
        return done(null,authenticatedUser.user);
    }
    catch(err){
        console.log(err);
        return done(new Error('Some error in authentication process.'));
    }
}));

// Set user for views
app.use(middlewares.setUser);

// Set Site Name
app.locals.siteName='CertificateVerifier';

/********************
 * CERTIFICATE ROUTES
 ********************/
app.use('/',certificateRoutes);

/******************
 * USER/Admin ROUTES
 ******************/
app.use('/',userRoutes);

// Error Handling Middleware
app.use(middlewares.error_handler);


app.listen(3000,()=>{
    console.log('Server started at PORT 3000');
});

// Handle ctrl+c termination
process.on('SIGINT',()=>{
    mongoose.connection.close(()=>{
        console.log('Database Connection Closed');
        process.exit(0);
    });
});