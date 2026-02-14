"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainEvents = exports.DomainEventBus = exports.DomainEventType = void 0;
const events_1 = require("events");
var DomainEventType;
(function (DomainEventType) {
    DomainEventType["INSTANCE_MATERIALIZED"] = "INSTANCE_MATERIALIZED";
    DomainEventType["VIOLATION_DETECTED"] = "VIOLATION_DETECTED";
    DomainEventType["SCORE_UPDATED"] = "SCORE_UPDATED";
})(DomainEventType || (exports.DomainEventType = DomainEventType = {}));
class DomainEventBus extends events_1.EventEmitter {
    // @ts-ignore
    emit(event, payload) {
        return super.emit(event, payload);
    }
    // @ts-ignore
    on(event, listener) {
        return super.on(event, listener);
    }
}
exports.DomainEventBus = DomainEventBus;
exports.domainEvents = new DomainEventBus();
