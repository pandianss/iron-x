"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/auth', authRoutes_1.default);
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const actionRoutes_1 = __importDefault(require("./routes/actionRoutes"));
app.use('/goals', goalRoutes_1.default);
app.use('/actions', actionRoutes_1.default);
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
app.use('/schedule', scheduleRoutes_1.default); // Mounts /schedule/today and /schedule/instances/:id/log
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
app.use('/analytics', analyticsRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Discipline Enforcement API');
});
const cron_1 = require("./cron");
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    (0, cron_1.startCronJobs)();
});
