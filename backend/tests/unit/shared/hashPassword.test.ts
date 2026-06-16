import { hashPassword, comparePassword } from '../../../src/shared/utils/hashPassword';

describe('hashPassword', () => {
  it('should return a hash different from the plain-text password', async () => {
    const plain = 'mySecret123!';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
  });

  it('should produce a valid bcrypt hash (starts with $2b$)', async () => {
    const hash = await hashPassword('anyPassword');
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it('should produce different hashes for the same input (salt is random)', async () => {
    const hash1 = await hashPassword('samePassword');
    const hash2 = await hashPassword('samePassword');
    expect(hash1).not.toBe(hash2);
  });
});

describe('comparePassword', () => {
  it('should return true when comparing the original password against its hash', async () => {
    const plain = 'correctPassword!';
    const hash = await hashPassword(plain);
    const result = await comparePassword(plain, hash);
    expect(result).toBe(true);
  });

  it('should return false when comparing a wrong password against a hash', async () => {
    const hash = await hashPassword('correctPassword!');
    const result = await comparePassword('wrongPassword!', hash);
    expect(result).toBe(false);
  });
});
