const AWS = require("aws-sdk");
const s3 = new AWS.S3();

module.exports = {
  upload: (folder, fileName, data) => {
    const bucketName = process.env.BUCKET_NAME;
    const keyName = `${folder}/${fileName}`;
    const params = { Bucket: bucketName, Key: keyName, Body: data };

    return new Promise((resolve, reject) => {
      s3.putObject(params, function(err, data) {
        if (err) reject(err);
        else
          console.log(
            "Successfully saved object to " + bucketName + "/" + keyName
          );
        resolve();
      });
    });
  }
};
