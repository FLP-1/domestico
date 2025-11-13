import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // rampa inicial
    { duration: '3m', target: 50 },  // sustentação
    { duration: '1m', target: 100 }, // pico de carga
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },   // rampa de saída
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1200'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.PERF_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.PERF_AUTH_TOKEN || '';

export default function () {
  const headers = AUTH_TOKEN
    ? { Authorization: `Bearer ${AUTH_TOKEN}` }
    : {};

  const endpoints = [
    `${BASE_URL}/api/time-clock/records?usuarioId=test-user`,
    `${BASE_URL}/api/tasks?status=PENDENTE`,
    `${BASE_URL}/api/documents?usuarioId=test-user`,
  ];

  endpoints.forEach(url => {
    const res = http.get(url, { headers, timeout: '30s' });

    check(res, {
      'status OK': r => r.status === 200,
      'tempo p95 aceitável': r => r.timings.duration < 800,
    });
  });

  sleep(1);
}
