import { v4 as uuidv4 } from 'uuid';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const TestFactory = {
    createUser: (overrides = {}) => ({
        user_id: uuidv4(),
        email: `test-${uuidv4()}@example.com`,
        password_hash: 'hashed_password',
        role_id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date(),
        current_discipline_score: 50,
        ...overrides
    }),

    createAction: (overrides = {}) => ({
        action_id: uuidv4(),
        title: `Action ${uuidv4().substring(0, 8)}`,
        description: `Description`,
        type: 'ROUTINE',
        ...overrides
    }),

    createInstance: (overrides = {}) => ({
        instance_id: uuidv4(),
        action_id: uuidv4(),
        status: 'PENDING',
        scheduled_date: new Date(),
        scheduled_start_time: new Date(),
        scheduled_end_time: new Date(),
        ...overrides
    }),

    createDisciplineScore: (overrides = {}) => ({
        score_id: uuidv4(),
        user_id: uuidv4(),
        score: randomInt(0, 100),
        date: new Date(),
        ...overrides
    }),

    createContext: (overrides = {}) => ({
        userId: uuidv4(),
        traceId: uuidv4(),
        timestamp: new Date(),
        user: {
            current_discipline_score: 50
        },
        instances: [],
        policy: {
            rules: {
                max_misses: 3,
                score_threshold: 40,
                lockout_hours: 4
            },
            mode: 'SOFT'
        },
        violations: [],
        ...overrides
    })
};
