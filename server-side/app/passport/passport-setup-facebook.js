const mongoose = require('mongoose');
const shortid = require('shortid');
const passport = require('passport');
const facebookStrategy = require('passport-facebook');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib');
const keys = require('./keys');
const appConfig =require('../../config/appConfig');

/* Models */
const UserModel = require('../models/User');


let baseUrl = `${appConfig.apiVersion}/users`;

passport.serializeUser((user,done)=>{
    done(null,user.id)
});

passport.deserializeUser((id,done)=>{
    UserModel.findById(id).then((user)=>{
        done(null,user.id)
    })
});

passport.use(new facebookStrategy({
    callbackURL:`${baseUrl}/auth/facebook/redirect`,
    clientID:keys.facebook.clientID,
    clientSecret:keys.facebook.clientSecret,
    profileFields: ['displayName', 'email']
},(accessToken,refreshToken,profile,done)=>{
    //passport callback function
     console.log(profile);
    //     let createUser = () => {
    //         return new Promise((resolve, reject) => {
    //             UserModel.findOne({ email: email.emails[0].value})
    //                 .exec((err, retrievedUserDetails) => {
    //                     if (err) {
    //                         logger.error(err.message, 'userController: createUser', 10)
    //                         let OauthResponse = response.generate(true, 'Failed To Create User', 500, null)
    //                         reject(OauthResponse)
    //                     } else if (check.isEmpty(retrievedUserDetails)) {
                           
    //                         let newUser = new UserModel({
    //                             userId: shortid.generate(),
    //                             firstName: profile.name.givenName,
    //                             lastName: profile.name.familyName || '',
    //                             email:  email.emails[0].value,
    //                             createdOn: time.now()
    //                         })
    //                         newUser.save((err, newUser) => {
    //                             if (err) {
    //                                 console.log(err)
    //                                 logger.error(err.message, 'userController: createUser', 10)
    //                                 let OauthResponse = response.generate(true, 'Failed to create new User', 500, null)
    //                                 reject(OauthResponse)
    //                             } else {
    //                                 let newUserObj = newUser.toObject();
    //                                 resolve(newUserObj)
    //                                 done(null,newUser);
    //                             }
    //                         })
    //                     } 
    //                     else{
    //                         let retrievedUserDetailsObj = retrievedUserDetails.toObject();
    //                         // console.log(retrievedUserDetailsObj);
    //                         delete retrievedUserDetailsObj.password
    //                         delete retrievedUserDetailsObj.__v
    //                         delete retrievedUserDetailsObj.createdOn
    //                         delete retrievedUserDetailsObj.modifiedOn
    //                         resolve(retrievedUserDetailsObj);
    //                         done(null,retrievedUserDetails);
    //                     }
    //                 })
    //         })
    //     }// end create user function
    //     createUser();
     })

)

