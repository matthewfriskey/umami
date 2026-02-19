import { hasBlockedIp } from '../detect';
import { getIpAddress } from '../ip';

const IP = '127.0.0.1';
const BAD_IP = '127.127.127.127';

test('getIpAddress: Custom header', () => {
  process.env.CLIENT_IP_HEADER = 'x-custom-ip-header';

  expect(getIpAddress(new Headers({ 'x-custom-ip-header': IP }))).toEqual(IP);
});

test('getIpAddress: CloudFlare header', () => {
  expect(getIpAddress(new Headers({ 'cf-connecting-ip': IP }))).toEqual(IP);
});

test('getIpAddress: Standard header', () => {
  expect(getIpAddress(new Headers({ 'x-forwarded-for': IP }))).toEqual(IP);
});

test('getIpAddress: No header', () => {
  expect(getIpAddress(new Headers())).toEqual(null);
});

test('hasBlockedIp: website ignore list supports multiple entries', () => {
  expect(hasBlockedIp(IP, `${BAD_IP}, ${IP}`)).toEqual(IP);
});

test('hasBlockedIp: website ignore list supports CIDR', () => {
  expect(hasBlockedIp(IP, '127.0.0.0/24')).toEqual('127.0.0.0/24');
});
