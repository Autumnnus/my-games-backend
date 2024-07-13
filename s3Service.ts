import { S3 } from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME ?? "";
const region = process.env.AWS_REGION ?? "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? "";

const s3 = new S3({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});

interface File {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

const s3Uploadv2 = async (
  file: File
): Promise<
  S3.ManagedUpload.SendData | { success: boolean; message: string }
> => {
  const params: S3.Types.PutObjectRequest = {
    ACL: "public-read-write",
    Bucket: bucketName,
    Key: `${uuid()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

interface S3DeleteResponse {
  success: boolean;
  message: string;
}

const s3Deletev2 = async (key: string): Promise<S3DeleteResponse> => {
  const params: S3.Types.DeleteObjectRequest = {
    Bucket: bucketName,
    Key: key
  };
  try {
    await s3.deleteObject(params).promise();
    return { success: true, message: "File deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

const s3Updatev2 = async (
  key: string,
  file: File
): Promise<
  S3.ManagedUpload.SendData | { success: boolean; message: string }
> => {
  const deleteResponse = await s3Deletev2(key);
  if (!deleteResponse.success) {
    return deleteResponse;
  }
  const params = {
    ACL: "public-read-write",
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  };
  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export { s3Deletev2, s3Updatev2, s3Uploadv2 };
