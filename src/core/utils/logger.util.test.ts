import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger } from './logger.util';

describe('createLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a logger with all log methods', () => {
    const logger = createLogger('TestContext');
    expect(logger.debug).toBeTypeOf('function');
    expect(logger.info).toBeTypeOf('function');
    expect(logger.warn).toBeTypeOf('function');
    expect(logger.error).toBeTypeOf('function');
  });

  it('formats messages with level and context', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = createLogger('MyService');
    logger.warn('something happened');
    expect(spy).toHaveBeenCalledWith('[WARN] [MyService] something happened');
  });

  it('passes extra arguments to console', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger('ErrorTest');
    const error = new Error('test');
    logger.error('failed', error);
    expect(spy).toHaveBeenCalledWith('[ERROR] [ErrorTest] failed', error);
  });

  it('logs debug in non-production environment', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createLogger('DebugTest');
    logger.debug('debug message');
    expect(spy).toHaveBeenCalledWith('[DEBUG] [DebugTest] debug message');
  });

  it('logs info in non-production environment', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('InfoTest');
    logger.info('info message');
    expect(spy).toHaveBeenCalledWith('[INFO] [InfoTest] info message');
  });
});
