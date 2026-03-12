import * as admin from 'firebase-admin';
import path from 'path';

// Note: To use this in production, set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to the service account JSON file.
// export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-file.json"

export const initializeFirebase = () => {
    if (!admin.apps.length) {
        try {
            // Attempt to initialize using default credentials (from GOOGLE_APPLICATION_CREDENTIALS ops env var)
            // or an explicit path if provided for local dev.
            const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

            if (serviceAccountPath) {
                const serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('[Firebase] Initialized Admin SDK with explicit service account');
            } else {
                admin.initializeApp();
                console.log('[Firebase] Initialized Admin SDK with Application Default Credentials');
            }
        } catch (error) {
            console.error('[Firebase] Failed to initialize Admin SDK:', error);
            // Don't throw if we're in test environments
            if (process.env.NODE_ENV !== 'test') {
                // throw error; 
            }
        }
    }

    return admin;
};

export const firebaseAdmin = initializeFirebase();
export const firebaseAuth = firebaseAdmin.auth();
