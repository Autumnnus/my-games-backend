import { color } from "console-log-colors";

class CustomError extends Error {
  status: number;
  constructor(message: string, status: number) {
    console.log(color.bg162("#message: " + message));
    super(message);
    this.status = status;
  }
}
export default CustomError;
