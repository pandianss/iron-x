// backend/tests/setup.ts
import 'reflect-metadata';

jest.mock('razorpay');
jest.mock('bullmq');

process.env.RAZORPAY_KEY_ID = 'test_key';
process.env.RAZORPAY_KEY_SECRET = 'test_secret';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.DATABASE_URL = 'file:./test.db';
