const dashboardController = require("./../../app/controllers/dashboardController");
const appConfig = require("./../../config/appConfig");
const auth = require('./../middlewares/auth');


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/dashboard`;
  
    app.get(`${baseUrl}/`,dashboardController.getAllIssues);
    app.post(`${baseUrl}/create`,auth.isAuthorized,dashboardController.createIssue);
    app.get(`${baseUrl}/view/:issueId`,dashboardController.viewByIssueId);
    app.get(`${baseUrl}/view/by/submitter/:submitter`,dashboardController.viewBySubmitter);
    app.post(`${baseUrl}/:issueId/delete`,auth.isAuthorized,dashboardController.deleteIssue);
    app.put(`${baseUrl}/:issueId/edit`,auth.isAuthorized,dashboardController.editIssue);
    app.post(`${baseUrl}/:issueId/viewers`,auth.isAuthorized,dashboardController.addYourselfAsIssueViewer);
    app.post(`${baseUrl}/:issueId/otherViewers`,auth.isAuthorized,dashboardController.addOthersAsIssueViewer);
    app.post(`${baseUrl}/:issueId/postComment`,auth.isAuthorized,dashboardController.postComment);
    app.post(`${baseUrl}/:issueId/viewComments`,auth.isAuthorized,dashboardController.viewComments);
}
