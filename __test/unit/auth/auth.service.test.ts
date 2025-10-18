import { AuthService } from '../../../src/contexts/auth/auth.service';
import { User } from '../../../src/contexts/auth/auth.model';
import '../../../__test/setup'; // executa o setup global

describe('AuthService', () => {
  const userData = {
    email: 'test@example.com',
    password: '123456',
    name: 'Test User',
  };

  it('should register a new user', async () => {
    const user = await AuthService.register(userData);
    expect(user.email).toBe(userData.email);

    const userInDb = await User.findOne({ email: userData.email });
    expect(userInDb).not.toBeNull();
  });

  it('should login successfully with correct credentials', async () => {
    await AuthService.register(userData);
    const token = await AuthService.login(userData.email, userData.password);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should fail login with wrong password', async () => {
    await AuthService.register(userData);

    await expect(
      AuthService.login(userData.email, 'wrongpass')
    ).rejects.toThrow('Invalid credentials');
  });
});