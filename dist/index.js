"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_log_colors_1 = require("console-log-colors");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const conn_1 = __importDefault(require("./db/conn"));
const ErrorHandler_1 = __importDefault(require("./middlewares/error/ErrorHandler"));
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, conn_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api", index_1.default);
app.use(ErrorHandler_1.default);
app.listen(PORT, () => {
    console.log(console_log_colors_1.color.bgCyan(`Server is running on port ${PORT}...`));
});
