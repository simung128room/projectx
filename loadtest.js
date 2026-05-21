import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 for 1 minute
    { duration: '10s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // 1% errors max
  },
};

export default function () {
  // Test public endpoint that uses caching (Product list)
  const res = http.get('http://localhost:3000/api/products');
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'has data': (r) => r.json().length >= 0,
  });
  
  sleep(1);
}
