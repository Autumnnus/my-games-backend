"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSendData = isSendData;
exports.isErrorData = isErrorData;
function isSendData(data) {
    return data.Location !== undefined;
}
function isErrorData(data) {
    return data.success !== undefined;
}
