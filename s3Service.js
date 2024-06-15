const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;
const dotenv = require("dotenv");
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});

exports.s3Uploadv2 = async (file) => {
  const params = {
    ACL: "public-read-write",
    Bucket: bucketName,
    Key: `uploads/${uuid()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
};
