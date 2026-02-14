"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const crypto = __importStar(require("crypto"));
exports.WebhookService = {
    // In a real system, these would be loaded from DB per user/tenant
    getSubscribers(event) {
        // Mock subscription
        return [
            { url: 'https://webhook.site/test', secret: 'whsec_test_secret_123' }
        ];
    },
    signPayload(payload, secret) {
        const data = JSON.stringify(payload);
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    },
    async dispatchEvent(event, data) {
        const subscribers = this.getSubscribers(event);
        const timestamp = new Date().toISOString();
        const payload = {
            event,
            timestamp,
            data
        };
        for (const sub of subscribers) {
            const signature = this.signPayload(payload, sub.secret);
            try {
                // console.log(`Dispatching ${event} to ${sub.url}`);
                // await fetch(sub.url, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'X-Discipline-Signature': signature,
                //         'X-Discipline-Event': event
                //     },
                //     body: JSON.stringify(payload)
                // });
            }
            catch (e) {
                console.error(`Failed to dispatch webhook to ${sub.url}`, e);
            }
        }
    }
};
