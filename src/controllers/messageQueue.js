var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-2'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const sendToQueue = async (certificate)=>{
    const data={
        name:certificate.name,
        email:certificate.email,
		    id:certificate._id,
        purpose:certificate.purpose,
        organization:certificate.organization,
        details:certificate.details,
        start:certificate.start,
        end: certificate.end,
        issuedOn:certificate.issuedOn
    };

    const params = {
        // The "Type":"New" is optional, provided for future use which would help to know the other microservice
        // if the certificate is issued new or edited.
       MessageAttributes: {
         "Type": {
           DataType: "String",
           StringValue: "New"
         }
       },
       MessageBody: JSON.stringify(data),
       QueueUrl: process.env.AWS_SQS_QUEUE_URL
     };

     return sqs.sendMessage(params).promise();
}

module.exports = sendToQueue;