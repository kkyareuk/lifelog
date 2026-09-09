const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {defineSecret}=require('firebase-functions/params');
const settings=defineSecret('MODERATION_EMAIL_CONFIG');
module.exports=onDocumentCreated({document:'moderationReports/{reportId}',region:'asia-northeast3',
 retry:true,timeoutSeconds:30,memory:'256MiB',maxInstances:1,concurrency:1,secrets:[settings]},
 require('./moderation-email').createHandler({config:()=>JSON.parse(settings.value())}));
