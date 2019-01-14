const mongoose = require('mongoose');
const time = require('../libs/timeLib');
const Schema = mongoose.Schema;

let issueSchema = new Schema({

    issueId:{
        type:String,
        unique:true
    },
    status:{
        type:String,
        default:'Backlog'
    }
    ,
    title:{
        type:String,
        default:''
    },
    description:{
        type:String,
        default:''
    },
    viewers:[{
        firstName:String,
        lastName:String,
        emailId:String,
        newOtherWatcherFirstName:String, default:'',
        newOtherWatcherLastName:String, default:'',
        newOtherWatcherEmailId:String, default:''
    }],
    viewerAddedBy:{
        type:String,
        default:''
    },
    email:{
        type:String,
        default:''
    },
    submitterFirstName:{
        type:String,
        default:''
    },
    submitterLastName:{
        type:String,
        default:''
    },
    editorFirstName:{
        type:String,
        default:''
    },
    editorLastName:{
        type:String,
        default:''
    },
    created:{
        type:String,
        default:time.standardFormat()
    },
    lastModified:{
        type:String,
        default:time.standardFormat()
    },
    color:{
        type:String,
        default:'black'
    },
    userComment:[{
        comment:String,
        commenterFirstName:String,
        commenterLastName:String
    }],
    notification:[{    
        firstName:String,
        lastName:String,
        emailId:String,
        notification:String,
        issueTitle:String,
        newOtherWatcherFirstName:String, default:'',
        newOtherWatcherLastName:String, default:'',
        newOtherWatcherEmailId:String, default:''
    }]
});

module.exports = mongoose.model('Issue',issueSchema);