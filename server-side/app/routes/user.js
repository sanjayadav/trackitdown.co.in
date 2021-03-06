const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig");
const auth = require('./../middlewares/auth');
const passport = require('passport');
const passportSetupGoogle = require('../passport/passport-setup-google');

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;
  
    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);

    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getSingleUser);
    
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    app.post(`${baseUrl}/login`, userController.loginFunction);

    app.get(`${baseUrl}/auth/google`,passport.authenticate('google',{scope:['profile','email']}));

    app.get(`${baseUrl}/auth/google/redirect`,passport.authenticate('google', { failureRedirect: `http://trackitdown.co.in/login` }),userController.googleAuth);

    app.get(`${baseUrl}/auth/facebook`,passport.authenticate('facebook',{scope:['profile']}));
    
    app.get(`${baseUrl}/auth/facebook/redirect`,passport.authenticate('facebook', { failureRedirect: `http://trackitdown.co.in/login` }),(req,res)=>{
     
        console.log("Reached Callback URI");
       
        res.redirect(`http://trackitdown.co.in/dashboard`);
    });
    app.get(`${baseUrl}/auth/twitter`,passport.authenticate('twitter',{scope:['profile']}));
    
    app.get(`${baseUrl}/auth/twitter/redirect`,passport.authenticate('twitter', { failureRedirect: `http://trackitdown.co.in/login` }),(req,res)=>{

        console.log("Reached Callback URI");
        res.redirect(`http://trackitdown.co.in/dashboard`);
    });

    app.put(`${baseUrl}/:userId/edit`, auth.isAuthorized, userController.editUser);

    app.post(`${baseUrl}/:userId/delete`, auth.isAuthorized, userController.deleteUser);

    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);

}
