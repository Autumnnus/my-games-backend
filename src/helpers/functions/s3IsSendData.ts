import { S3 } from "aws-sdk";

export function isSendData(data: any): data is S3.ManagedUpload.SendData {
  return (data as S3.ManagedUpload.SendData).Location !== undefined;
}

export function isErrorData(
  data: any
): data is { success: boolean; message: string } {
  return (data as { success: boolean; message: string }).success !== undefined;
}
