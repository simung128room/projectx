import http from 'k6/http';
import { check, sleep } from 'k6';

// -------------------------------------------------------------
// K6 Load Test script for Virtual Store API (Inventory Focus)
// RUN: k6 run scripts/k6-load-test.js
// -------------------------------------------------------------

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // Ramp up to 50 concurrent users
        { duration: '1m', target: 200 },  // Spike to 200 concurrent users ("Flash Sale")
        { duration: '30s', target: 0 },   // Cool down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],    // Errors should be less than 1%
        http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
// Replace with a real test user's JWT token and a test product ID
const AUTH_TOKEN = __ENV.TOKEN || 'TEST_BEARER_TOKEN';
const TEST_PRODUCT_ID = __ENV.PRODUCT_ID || 'test_product_123';

export default function () {
    // 1. Browsing Load (High frequency)
    const browseRes = http.get(`${BASE_URL}/products`);
    check(browseRes, {
        'products loaded': (r) => r.status === 200,
    });
    
    // Slight human delay
    sleep(Math.random() * 0.5);

    // 2. Buy Load (High contention)
    // Generating dynamic idempotency key matching our frontend logic
    const idempotencyKey = `buy_${TEST_PRODUCT_ID}_${new Date().getTime()}_${Math.random().toString(36).substring(2)}`;
    
    const payload = JSON.stringify({
        productId: TEST_PRODUCT_ID,
        quantity: 1,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Idempotency-Key': idempotencyKey,
        },
    };

    const buyRes = http.post(`${BASE_URL}/buy`, payload, params);
    
    check(buyRes, {
        'buy succeeded': (r) => r.status === 200 || r.status === 400 || r.status === 402, // 400/402 are acceptable "Not enough stock/balance" domain errors, not crash errors
    });

    sleep(1);
}
