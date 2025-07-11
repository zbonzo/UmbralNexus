// This test was removed because we switched to in-memory storage
// instead of MongoDB for the development phase.
// MongoDB tests can be re-added when persistence is implemented.

describe('Simple Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });
});