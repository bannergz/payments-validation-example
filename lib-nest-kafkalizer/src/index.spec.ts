import { Kafkalizer } from '../src';

describe('Kafkalizer', () => {
  it('should instantiate with default config', () => {
    const kafkalizer = new Kafkalizer();
    expect(kafkalizer).toBeDefined();
  });
});
