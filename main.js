var qr = require("qr-image");
var AWS = require('aws-sdk')
var fs = require("fs")
var s3Stream = require('s3-upload-stream')(new AWS.S3())


function generate_file_name () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

function upload_image(stream){
    try{
        var file_name = generate_file_name() + ".png";
        var upload = s3Stream.upload({
            "Bucket": "reportfile",
            "Key": file_name
        });
        stream.pipe(upload);
        return file_name;
    }
    catch(ex)
    {
        return JSON.stringify(ex);
    }
}

exports.handler = function(event, context, callback){
    var url = event['queryStringParameters']['url']
    var image_stream = qr.image(url, {type: 'png'});
    var responseBody = {
        "url": upload_image(image_stream)
    }

    var response = {
        statusCode: 200,
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(responseBody),
        isBase64Encoded: false
    };
    callback(null, response);
}

