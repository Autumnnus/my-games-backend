"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Uploadv2 = exports.s3Updatev2 = exports.s3Deletev2 = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const bucketName = (_a = process.env.AWS_BUCKET_NAME) !== null && _a !== void 0 ? _a : "";
const region = (_b = process.env.AWS_REGION) !== null && _b !== void 0 ? _b : "";
const accessKeyId = (_c = process.env.AWS_ACCESS_KEY_ID) !== null && _c !== void 0 ? _c : "";
const secretAccessKey = (_d = process.env.AWS_SECRET_ACCESS_KEY) !== null && _d !== void 0 ? _d : "";
const s3 = new aws_sdk_1.S3({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});
const s3Uploadv2 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        ACL: "public-read-write",
        Bucket: bucketName,
        Key: `${(0, uuid_1.v4)()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };
    try {
        const uploadResult = yield s3.upload(params).promise();
        return uploadResult;
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
exports.s3Uploadv2 = s3Uploadv2;
const s3Deletev2 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: bucketName,
        Key: key
    };
    try {
        yield s3.deleteObject(params).promise();
        return { success: true, message: "File deleted successfully" };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
exports.s3Deletev2 = s3Deletev2;
const s3Updatev2 = (key, file) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteResponse = yield s3Deletev2(key);
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
        const uploadResult = yield s3.upload(params).promise();
        return uploadResult;
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
exports.s3Updatev2 = s3Updatev2;
