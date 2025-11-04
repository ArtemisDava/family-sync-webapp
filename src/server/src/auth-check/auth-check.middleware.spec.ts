import { AuthCheckMiddleware } from './auth-check.middleware';

describe('AuthCheckMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthCheckMiddleware()).toBeDefined();
  });
});
