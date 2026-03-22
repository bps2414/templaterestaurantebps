import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 5 },
  ],
};

export default function () {
  check(true, { 'dummy check': (r) => r === true });
  sleep(1);
}
