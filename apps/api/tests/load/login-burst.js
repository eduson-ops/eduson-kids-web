import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const p95Latency = new Trend('p95_latency');
const errorRate = new Rate('error_rate');

export const options = {
  scenarios: {
    login_burst: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    error_rate: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Pre-generated test credentials
// In real test: seed DB with test users first
const TEST_LOGINS = Array.from({ length: 1000 }, (_, i) => ({
  login: `test-child-${i}-ab`,
  pin: '123456',
}));

export default function () {
  const vuIndex = __VU - 1;
  const creds = TEST_LOGINS[vuIndex % TEST_LOGINS.length];

  // Step 1: Login
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/child/login`,
    JSON.stringify(creds),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
    },
  );

  const loginOk = check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'has accessToken': (r) => {
      try {
        return !!JSON.parse(r.body).accessToken;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!loginOk);
  p95Latency.add(loginRes.timings.duration);

  if (!loginOk) {
    sleep(0.1);
    return;
  }

  const { accessToken } = JSON.parse(loginRes.body);
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Step 2: Send 5 progress events
  const eventKinds = ['lesson_solved', 'puzzle_solved', 'coins_earned', 'streak_touched', 'lesson_solved'];
  for (const kind of eventKinds) {
    const payload = kind === 'coins_earned' ? { amount: 10 } : { lessonId: `lesson-${Math.floor(Math.random() * 48)}` };

    const eventRes = http.post(
      `${BASE_URL}/api/v1/progress/event`,
      JSON.stringify({ kind, payload }),
      { headers: authHeaders, timeout: '10s' },
    );

    check(eventRes, {
      'event recorded': (r) => r.status === 201,
    });

    errorRate.add(eventRes.status >= 400);
    p95Latency.add(eventRes.timings.duration);
  }

  // Step 3: Get summary
  const summaryRes = http.get(`${BASE_URL}/api/v1/progress/me/summary`, {
    headers: authHeaders,
    timeout: '10s',
  });

  check(summaryRes, {
    'summary ok': (r) => r.status === 200,
  });

  sleep(0.1);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'];
  const errRate = data.metrics.http_req_failed?.values?.rate;

  console.log(`\n=== LOAD TEST RESULTS ===`);
  console.log(`p95 latency: ${p95?.toFixed(1)}ms (target: <500ms)`);
  console.log(`Error rate: ${(errRate * 100)?.toFixed(2)}% (target: <1%)`);
  console.log(`Total requests: ${data.metrics.http_reqs?.values?.count}`);
  console.log(`========================\n`);

  return {
    'tests/load/results.json': JSON.stringify(data, null, 2),
  };
}
