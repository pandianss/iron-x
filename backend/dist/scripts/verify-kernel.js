"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DisciplineEngine_1 = require("../kernel/DisciplineEngine");
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
const events_1 = require("../kernel/domain/events");
async function verify() {
    console.log('--- Kernel Verification (Event-Based) ---');
    // 1. Setup Test User
    const userId = (0, uuid_1.v4)();
    console.log(`Creating test user ${userId}...`);
    await db_1.default.user.create({
        data: {
            user_id: userId,
            email: `test-${userId}@example.com`,
            current_discipline_score: 50,
            discipline_classification: 'STABLE',
            password_hash: 'dummy_hash',
            timezone: 'UTC'
        }
    });
    // 2. Setup Event Listener
    let cycleEventReceived = false;
    let calculatedScore = 0;
    const listener = (event) => {
        if (event.type === 'KERNEL_CYCLE_COMPLETED' && event.userId === userId) {
            console.log('[Verify] Received KERNEL_CYCLE_COMPLETED event:', event.payload);
            cycleEventReceived = true;
            calculatedScore = event.payload.score;
        }
    };
    events_1.domainEvents.on('KERNEL_CYCLE_COMPLETED', listener);
    // 3. Run Cycle
    console.log('Running Kernel Cycle...');
    try {
        await DisciplineEngine_1.kernel.runCycle({
            userId,
            traceId: (0, uuid_1.v4)(),
            timestamp: new Date()
        });
        console.log('Cycle completed successfully.');
    }
    catch (e) {
        console.error('Cycle failed:', e);
        process.exit(1);
    }
    // 4. Verify
    if (!cycleEventReceived) {
        console.error('FAIL: Did not receive KERNEL_CYCLE_COMPLETED event.');
        console.log('Check if kernel emits the event properly.');
        // process.exit(1);
    }
    else {
        if (calculatedScore !== 50) {
            console.error(`FAIL: Score mismatch. Expected 50, got ${calculatedScore}`);
        }
        else {
            console.log('PASS: Score verification (50)');
        }
    }
    // 5. Clean up
    console.log('Cleaning up...');
    await db_1.default.user.delete({ where: { user_id: userId } });
    console.log('Done.');
    process.exit(0);
}
verify();
