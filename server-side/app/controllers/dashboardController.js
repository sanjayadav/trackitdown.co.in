const shortid = require('shortid');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib')
const time = require('./../libs/timeLib');
/* Models */
const IssueModel = require('../models/Issue');
const UserModel = require('../models/User');
const AuthModel = require('../models/Auth');

/**
 * function to read all issues.
 */
let getAllIssues = (req, res) => {
    IssueModel.find()
    .select('-__v -_id')
    .lean()
    .exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Issue Controller: getAllIssue', 10)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Issue Found', 'Issue Controller: getAllIssue')
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    })
}// end get all issues

/**
 * function to create the issue.
 */
let createIssue = (req, res) => {
    let findIssueCreator=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findIssueCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('User Not Found!', 'Dashboard Controller: findIssueCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found!', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }
    let issueCreationFunction = (userDetails) => {
        return new Promise((resolve, reject) => {
            console.log(req.body)
            if (check.isEmpty(req.body.title) || check.isEmpty(req.body.description)) {
                console.log("403, forbidden request");
                let apiResponse = response.generate(true, 'Required parameters are missing!', 403, null)
                reject(apiResponse)
            } else {
                var today = time.standardFormat()
                let issueId = shortid.generate()

                let newIssue = new IssueModel({
                    issueId: issueId,
                    title: req.body.title,
                    description: req.body.description,
                    status: req.body.status,
                    email:userDetails.email,
                    submitterFirstName: userDetails.firstName,
                    submitterLastName : userDetails.lastName,
                    editorFirstName:null,
                    editorLastName:null,
                    created: today,
                    lastModified: today
                }) // end new issue model
            
                if (req.body.status == "Backlog") newIssue.color = "#FF3F3F";
                else if(req.body.status == "In-Progress") newIssue.color = "#FFCE2B";
                else if(req.body.status == "In-Test") newIssue.color = "#F74E00";
                else if(req.body.status == "Completed") newIssue.color = "#006400";
                else newIssue.color = "black";
             
                newIssue.save((err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } else {
                        console.log('Success in issue creation')
                        resolve(result)
                    }
                }) // end new issue save
            }
        }) // end new issue promise
    } // end create issue function

    // making promise call.

    findIssueCreator()
    .then(issueCreationFunction)
    .then((result) => {
        let apiResponse = response.generate(false, 'Issue Created Successfully!', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

/**
 * function to read single issue.
 */
let viewByIssueId = (req, res) => {

    if (check.isEmpty(req.params.issueId)) {
        console.log('issueId should be passed')
        let apiResponse = response.generate(true, 'issueId is missing', 403, null)
        res.send(apiResponse)
    } else {
        IssueModel.findOne({ 'issueId': req.params.issueId }).select('-__v -_id') 
        .exec((err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('Issue Not Found.')
                let apiResponse = response.generate(true, 'Issue Not Found.', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("Issue found successfully","IssueController:ViewIssueById",5)
                let apiResponse = response.generate(false, 'Issue Found Successfully.', 200, result)
                res.send(apiResponse);
            }
        })
    }
}


/**
 * function to read issues by submitter.
 */
let viewBySubmitter = (req, res) => {
    if (check.isEmpty(req.params.submitter)) {
        console.log('submitter should be passed')
        let apiResponse = response.generate(true, 'Reporter is missing!', 403, null)
        res.send(apiResponse)
    } else {
        IssueModel.find({ 'submitter': req.params.submitter }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('Issues Not Found.')
                let apiResponse = response.generate(true, 'Issues Not Found', 404, null)
                res.send(apiResponse)
            } else {
                console.log('Issues Found Successfully')
                let apiResponse = response.generate(false, 'Issues Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        })
    }
}

/**
 * function to edit issue by admin.
 */
let editIssue = (req, res) => {
    let findIssueEditor=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findIssueCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('User Not Found!', 'Dashboard Controller: findIssueCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found.', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }
    let assignIssueEditor=(userDetails) =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.issueId)) {
                console.log('issueId should be passed')
                let apiResponse = response.generate(true, 'issueId is missing', 403, null)
                reject(apiResponse)
            } else {
                    IssueModel.findOne({'issueId': req.params.issueId}).exec((err, result) => { 
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    }
                    else {
                        if(result.viewers.length!=0){
                            let flag = 0;
                            for(let i = 0; i < result.viewers.length; i++){
                                let viewer = result.viewers[i].emailId;
                                if(viewer==userDetails.email){
                                    flag=1;
                                }
                            }
                            if(flag==0){
                                logger.info('Not Authorized to edit issues.', 'Dashboard Controller: findIssueViewer')
                                let apiResponse = response.generate(true, 'Not Authorized to Edit issues.', 500, null)
                                reject(apiResponse)
                            }
                            else if(flag==1){
                                logger.info('Authorized to add watchers', 'Dashboard Controller: findIssueViewer')
                                let apiResponse = response.generate(false, 'Authorized to add watchers!', 200,  null)

                                result.set({ editorFirstName: userDetails.firstName,editorLastName:userDetails.lastName,lastModified:time.standardFormat() });
                                result.notification.push({'firstName': userDetails.firstName,'lastName':userDetails.lastName,'emailId':userDetails.email,'notification': 'has edited issue "','issueTitle':result.title+'"'});
                                result.save(function (err, updatedResult) {
                                    if (err){
                                        console.log(err)
                                        logger.error(err.message, 'Dashboard Controller: assignIssueEditor', 10)
                                        let apiResponse = response.generate(true, 'Failed To Find Editor Details', 500, null)
                                        reject(apiResponse)
                                    }else{
                                        let apiResponse = response.generate(false, 'Edited Successfully.', 200, updatedResult)
                                        resolve(updatedResult)
                                    }   
                                });
                            }
                        }
                        else{ 
                            logger.info('Add Yourself as a watcher first.', 'Dashboard Controller: findIssueViewer')
                            let apiResponse = response.generate(true, 'Add Yourself as a watcher first.', 500, null)
                            reject(apiResponse)
                        }                     
                    }
                })
            }
        })
    }
    let issueEditFunction=(updatedResult) =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(updatedResult.issueId)) {
                console.log('issueId should be passed')
                let apiResponse = response.generate(true, 'issueId is missing', 403, null)
                reject(apiResponse)
            } else {
                let options = req.body;        
                if (options.status == "Backlog") options.color = "#FF3F3F";
                else if(options.status == "In-Progress") options.color = "#FFCE2B";
                else if(options.status == "In-Test") options.color = "#F74E00";
                else if(options.status == "Completed") options.color = "#006400";
                else options.color = "black";
                IssueModel.update({ 'issueId': updatedResult.issueId}, options, { multi: true}).
                exec((err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        console.log('Issue Not Found.')
                        let apiResponse = response.generate(true, 'Issue Not Found', 404, null)
                        reject(apiResponse)
                    } else {
                        console.log('Issue Edited Successfully')
                        let apiResponse = response.generate(false, 'Issue Edited Successfully!', 200, result)
                        resolve(result)
                    }
                })
            }
        })
    }
    findIssueEditor()
    .then(assignIssueEditor)
    .then(issueEditFunction)
    .then((result) => {
        let apiResponse = response.generate(false, 'Issue Edited successfully!', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}
/**
 * function to delete the assignment collection.
 */
let deleteIssue = (req, res) => {
    let findCurrentUser=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findIssueCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('User Not Found!', 'Dashboard Controller: findIssueCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }
    let findIssue=(userDetails) =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.issueId)) {
                console.log('issueId should be passed')
                let apiResponse = response.generate(true, 'issueId is missing', 403, null)
                reject(apiResponse)
            } 
            else {
                IssueModel.findOne({ 'issueId': req.params.issueId }, (err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } 
                    else if (check.isEmpty(result)) {
                        console.log('Issue Not Found.')
                        let apiResponse = response.generate(true, 'Issue Not Found!', 404, null)
                        reject(apiResponse)
                    } 
                    else {          
                        console.log('Issue Found')
                        let apiResponse = response.generate(false, 'Issue Found', 200, result)
                        if(userDetails.email!=result.email){
                            console.log('Not Authorized to delete this Issue!')
                            let apiResponse = response.generate(true, 'Not authorized to delete this issue!', 500, null)
                            reject(apiResponse)
                        }
                        else if(userDetails.email==result.email){
                            userEmail = result.email
                            console.log('Authorized to delete this issue!')
                            let apiResponse = response.generate(true, 'Authorized to delete this issue!', 200, userEmail)
                            resolve(userEmail)
                        }
                    }
                });                       
            }
        })
    }
   
    let deleteThisIssue=() =>{
        return new Promise((resolve, reject) => {
            IssueModel.remove({'issueId': req.params.issueId }, (err, result) => {
                if (err) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    console.log('Issue Not Found.')
                    let apiResponse = response.generate(true, 'Issue Not Found.', 404, null)
                    reject(apiResponse)
                } else {
                    console.log('Issue Deletion Success')
                    let apiResponse = response.generate(false, 'Issue Deleted Successfully!', 200, result)
                    resolve(apiResponse)
                }
            })
        })
    }
    findCurrentUser(req,res)
    .then(findIssue)
    .then(deleteThisIssue)
    .then((result) => {
        let apiResponse = response.generate(false, 'Issue Deleted.', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

/**
 * function to add user as a viewer of an issue.
 */
let addYourselfAsIssueViewer = (req, res) => {
    
    let findIssue=() =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.issueId)) {
                console.log('issueId should be passed')
                let apiResponse = response.generate(true, 'issueId is missing', 403, null)
                reject(apiResponse)
            } 
            else {
                IssueModel.findOne({ 'issueId': req.params.issueId }, (err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } 
                    else if (check.isEmpty(result)) {
                        console.log('Issue Not Found.')
                        let apiResponse = response.generate(true, 'Issue Not Found', 404, null)
                        reject(apiResponse)
                    } 
                    else {          
                        console.log('Issue Found')
                        let apiResponse = response.generate(false, 'Issue Found', 200, result)
                        resolve(result)
                    }
                });                       
            }
        })
    }

    let findIssueCreator=(issueDetails) =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findIssueCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('No User Found', 'Dashboard Controller: findIssueCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                }else {
                    let apiResponse = response.generate(false, 'User Details Found', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    if(issueDetails.viewers.length!=0){
                        let flag=0;
                        for(let i = 0; i < issueDetails.viewers.length; i++){
                            let viewer = issueDetails.viewers[i].emailId;                            
                            if(viewer==retrievedUserDetailsObj.email){
                                flag=1;
                            }   
                        }
                        if(flag==1){
                            logger.info('You are already a watcher!', 'Dashboard Controller: findIssueCreator')
                            let apiResponse = response.generate(true, 'You are already a watcher!', 500, null)
                            reject(apiResponse)
                        }
                        else if(flag==0){
                            let newViewer = {'firstName':retrievedUserDetailsObj.firstName,'lastName':retrievedUserDetailsObj.lastName,'emailId':retrievedUserDetailsObj.email};
                            logger.info('New Viewer Found', 'Dashboard Controller: findIssueCreator')
                            let apiResponse = response.generate(true, 'New Viewer Found!', 200,  newViewer)
                            resolve(newViewer)
                        }
                    
                    }else{ 
                        let newViewer = {'firstName':retrievedUserDetailsObj.firstName,'lastName':retrievedUserDetailsObj.lastName,'emailId':retrievedUserDetailsObj.email};                       
                        logger.info('New Viewer Found', 'Dashboard Controller: findIssueCreator')
                        let apiResponse = response.generate(true, 'New Viewer Found', 200, newViewer)
                        resolve(newViewer)
                    }
                }
            })
        })
    }
    let addNewViewer=(viewerID) =>{
        return new Promise((resolve, reject) => {      
            IssueModel.findOne({'issueId': req.params.issueId}).exec((err, result) => {        
                if (err) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    reject(apiResponse)
                }
                else {
                    result.viewers.push({'firstName': viewerID.firstName,'lastName':viewerID.lastName, 'emailId':viewerID.emailId});
                    result.notification.push({'firstName': viewerID.firstName,'lastName':viewerID.lastName, 'emailId':viewerID.emailId,'notification':" is added as a watcher."});
                    result.save(function (err, updatedViewers) {
                        if (err){
                            console.log(err)
                            logger.error(err.message, 'Dashboard Controller: addNewViewer', 10)
                            let apiResponse = response.generate(true, 'Failed To Find Viewer Details!', 500, null)
                            reject(apiResponse)
                        }else{
                            let apiResponse = response.generate(false, 'Viewer Added Successfully.', 200, updatedViewers)
                            resolve(updatedViewers)
                        }                      
                    });
                }
            })      
        })
    }

    findIssue(req,res)
    .then(findIssueCreator)
    .then(addNewViewer)
    .then((result) => {
        let apiResponse = response.generate(false, 'Viewer Added Successfully.', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}
/**
 * function to add other users as a viewer of an issue.
 */
let addOthersAsIssueViewer = (req, res) => {
    
    let findIssue=() =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.issueId)) {
                console.log('issueId should be passed')
                let apiResponse = response.generate(true, 'issueId is missing', 403, null)
                reject(apiResponse)
            } 
            else {
                IssueModel.findOne({ 'issueId': req.params.issueId }, (err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } 
                    else if (check.isEmpty(result)) {
                        console.log('Issue Not Found.')
                        let apiResponse = response.generate(true, 'Issue Not Found', 404, null)
                        reject(apiResponse)
                    } 
                    else {          
                        console.log('Issue Found')
                        let apiResponse = response.generate(false, 'Issue Found', 200, result)
                        resolve(result)
                    }
                });                       
            }
        })
    }

    let findIssueViewers=(issueDetails) =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findIssueCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if(check.isEmpty(retrievedUserDetails)) {
                    logger.info('No User Found', 'Dashboard Controller: findIssueCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                }else {
                    let apiResponse = response.generate(false, 'User Details Found', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    if(issueDetails.viewers.length!=0){
                        let flag =0;
                        for(let i = 0; i < issueDetails.viewers.length; i++){
                            let viewer = issueDetails.viewers[i].emailId;   
                            if(viewer==retrievedUserDetailsObj.email) {
                                flag=1;
                            }   
                        }
                        if(flag==0){
                            logger.info('Not Authorized to add watchers', 'Dashboard Controller: findIssueViewer')
                            let apiResponse = response.generate(true, 'Not authorized to add watchers', 500, null)
                            reject(apiResponse)
                        }
                        else if(flag==1){
                            let viewerID = {'firstName':retrievedUserDetailsObj.firstName,'lastName':retrievedUserDetailsObj.lastName,'emailId':retrievedUserDetailsObj.email};
                            logger.info('Authorized to add watchers', 'Dashboard Controller: findIssueViewer')
                            let apiResponse = response.generate(false, 'Authorized to add watchers', 200,  viewerID)
                            resolve(viewerID)
                        }                
                    }else{ 
                        logger.info('Add Yourself as a watcher first.', 'Dashboard Controller: findIssueViewer')
                            let apiResponse = response.generate(true, 'Please add yourself as a watcher first.', 500, null)
                            reject(apiResponse)
                    }
                }
            })
        })
    }
    let addNewViewer=(viewerID) =>{
        return new Promise((resolve, reject) => {      
            IssueModel.findOne({'issueId': req.params.issueId}).exec((err, result) => {        
                if (err) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    reject(apiResponse)
                }
                else {
                    UserModel.findOne({ 'email': req.body.addOtherViewer})
                    .exec((err,retrievedUserDetails)=>{
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'Dashboard Controller: addNewViewer', 10)
                            let apiResponse = response.generate(true, 'No User Found by that Email ID.', 500, null)
                            reject(apiResponse)
                        } else if(check.isEmpty(retrievedUserDetails)) {
                            logger.info('No User Found by that Email ID.', 'Dashboard Controller: addNewViewer')
                            let apiResponse = response.generate(true, 'No User Found by that Email ID', 404, null)
                            reject(apiResponse)
                        }else {
                            let retrievedUserDetailsObj=retrievedUserDetails.toObject();
                            let newOtherViewer = {'firstName': retrievedUserDetailsObj.firstName,'lastName':retrievedUserDetailsObj.lastName,'emailId': retrievedUserDetailsObj.email};
                            let flagx=0;
                            for(let i = 0; i < result.viewers.length; i++){
                                let viewer = result.viewers[i].newOtherWatcherEmailId;
                                if(viewer==newOtherViewer.emailId){      
                                    flagx=1;
                                }                     
                            }
                            if(flagx==1){
                                logger.info('Already a Viewer', 'Dashboard Controller: findIssueCreator')
                                let apiResponse = response.generate(true, 'Already a Viewer', 500, null)
                                reject(apiResponse)
                            }
                            else if(flagx==0){
                                result.viewers.push({'firstName':viewerID.firstName,'lastName':viewerID.lastName,'emailId':viewerID.emailId,'newOtherWatcherFirstName': newOtherViewer.firstName,'newOtherWatcherLastName':newOtherViewer.lastName, 'newOtherWatcherEmailId':newOtherViewer.emailId});
                                result.notification.push({'firstName':  viewerID.firstName,'lastName': viewerID.lastName,'emailId':viewerID.emailId ,'notification':" added as a watcher by ", 'newOtherWatcherFirstName': newOtherViewer.firstName,'newOtherWatcherLastName':newOtherViewer.lastName, 'newOtherWatcherEmailId':newOtherViewer.emailId });
                                result.save(function (err, updatedViewers) {
                                    if (err){
                                        console.log(err)
                                        logger.error(err.message, 'Dashboard Controller: addNewViewer', 10)
                                        let apiResponse = response.generate(true, 'Failed To Find Viewer Details', 500, null)
                                        reject(apiResponse)
                                    }else{
                                        let apiResponse = response.generate(false, 'Viewer Added Successfully.', 200, updatedViewers)
                                        resolve(updatedViewers)
                                    }                      
                                }); 
                            }                                                     
                        }
                    })
                }
            })      
        })
    }

    findIssue(req,res)
    .then(findIssueViewers)
    .then(addNewViewer)
    .then((result) => {
        let apiResponse = response.generate(false, 'Viewer Added Successfully', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

/**
 * function to post comments on an issue.
 */
let postComment = (req, res) => {
    let findUser=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findIssueCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if(check.isEmpty(retrievedUserDetails)) {
                    logger.info('No User Found', 'Dashboard Controller: findIssueCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                }else {
                    let apiResponse = response.generate(false, 'User Details Found', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }
    let findIssue=(userDetails) =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.issueId)) {
                console.log('issueId should be passed')
                let apiResponse = response.generate(true, 'issueId is missing', 403, null)
                reject(apiResponse)
            } 
            else {
                IssueModel.findOne({ 'issueId': req.params.issueId }, (err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } 
                    else if (check.isEmpty(result)) {
                        console.log('Issue Not Found.')
                        let apiResponse = response.generate(true, 'Issue Not Found', 404, null)
                        reject(apiResponse)
                    } 
                    else {          
                        console.log('Issue Found')
                        let apiResponse = response.generate(false, 'Issue Found', 200, result)
                        result.userComment.push({'comment': req.body.userComment,'commenterFirstName': userDetails.firstName,'commenterLastName':userDetails.lastName});
                        result.notification.push({'firstName': userDetails.firstName,'lastName':userDetails.lastName,'emailId':userDetails.email,'notification': 'has posted a comment on "', 'issueTitle':result.title+'".'});
                        result.save(function (err, updatedComments) {
                            if (err){
                                console.log(err)
                                logger.error(err.message, 'Dashboard Controller: postComment', 10)
                                let apiResponse = response.generate(true, 'Failed to post comment.', 500, null)
                                reject(apiResponse)
                            }else{
                                let apiResponse = response.generate(false, 'Comment Posted Successfully.', 200, updatedComments)
                                resolve(updatedComments)
                            }                      
                        });
                    }
                });                       
            }
        })
    }
    findUser(req,res)
    .then(findIssue)
    .then((result) => {
        let apiResponse = response.generate(false, 'Comment Posted Successfully!', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

//function to see comments of an issue without reloading the page
let viewComments = (req, res) => {

    if (check.isEmpty(req.params.issueId)) {
        console.log('issueId should be passed')
        let apiResponse = response.generate(true, 'issueId is missing', 403, null)
        res.send(apiResponse)
    } else {
        IssueModel.findOne({ 'issueId': req.params.issueId }).select('-__v -_id') 
        .exec((err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('Issue Not Found.')
                let apiResponse = response.generate(true, 'Issue Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("Issue found successfully","IssueController:ViewIssueById",5)
                let apiResponse = response.generate(false, 'Issue Found Successfully.', 200, result)
                res.send(result.userComment);
            }
        })
    }
}


module.exports = {
    getAllIssues: getAllIssues,
    createIssue: createIssue,
    viewByIssueId : viewByIssueId, 
    viewBySubmitter: viewBySubmitter,
    editIssue: editIssue,
    deleteIssue: deleteIssue,
    addYourselfAsIssueViewer : addYourselfAsIssueViewer,
    addOthersAsIssueViewer : addOthersAsIssueViewer,
    postComment : postComment,
    viewComments : viewComments
}// end exports
