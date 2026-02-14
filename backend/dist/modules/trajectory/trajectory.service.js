"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryService = void 0;
const trajectory_classification_1 = require("./trajectory.classification");
const trajectory_projection_1 = require("./trajectory.projection");
const trajectory_reporter_1 = require("./trajectory.reporter");
exports.TrajectoryService = {
    ...trajectory_classification_1.trajectoryClassification,
    ...trajectory_projection_1.trajectoryProjection,
    ...trajectory_reporter_1.trajectoryReporter
};
