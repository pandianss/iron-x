"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const cron_1 = require("./cron");
const registerObservers_1 = require("./bootstrap/registerObservers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const logger_1 = require("./utils/logger");
app_1.default.listen(port, () => {
    logger_1.Logger.info(`Server is running on port ${port}`);
    (0, registerObservers_1.registerObservers)();
    (0, cron_1.startCronJobs)();
});
