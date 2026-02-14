"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineStatus = exports.EnforcementMode = void 0;
var EnforcementMode;
(function (EnforcementMode) {
    EnforcementMode["NONE"] = "NONE";
    EnforcementMode["SOFT"] = "SOFT";
    EnforcementMode["HARD"] = "HARD";
})(EnforcementMode || (exports.EnforcementMode = EnforcementMode = {}));
var DisciplineStatus;
(function (DisciplineStatus) {
    DisciplineStatus["STABLE"] = "STABLE";
    DisciplineStatus["DRIFTING"] = "DRIFTING";
    DisciplineStatus["BREACH"] = "BREACH";
    DisciplineStatus["STRICT"] = "STRICT";
})(DisciplineStatus || (exports.DisciplineStatus = DisciplineStatus = {}));
