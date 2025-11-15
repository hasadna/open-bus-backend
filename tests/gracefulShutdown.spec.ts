import { gracefulShutdown, setupGracefulShutdown } from '../src/utils/gracefulShutdown';
import { cleanup, createFastifyMock } from './test.utils.spec';

describe('gracefulShutdown', () => {
  let exitSpy: jest.SpyInstance;
  let fastify: any;

  beforeEach(() => {
    fastify = createFastifyMock();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  afterEach(() => {
    cleanup();
  });

  it('should log shutdown and exit 0 on success', async () => {
    await gracefulShutdown(fastify, 'SIGTERM');
    expect(fastify.log.info).toHaveBeenCalledWith('Received SIGTERM. Starting graceful shutdown...');
    expect(fastify.close).toHaveBeenCalled();
    expect(fastify.log.info).toHaveBeenCalledWith('Server closed successfully');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('should log error and exit 1 on failure', async () => {
    const error = new Error('fail');
    fastify.close.mockRejectedValue(error);
    await gracefulShutdown(fastify, 'SIGINT');
    expect(fastify.log.error).toHaveBeenCalledWith('Error during graceful shutdown:', error);
    expect(exitSpy).toHaveBeenCalledWith(1);
    // Also check that info log for shutdown was called
    expect(fastify.log.info).toHaveBeenCalledWith('Received SIGINT. Starting graceful shutdown...');
  });
});

describe('setupGracefulShutdown', () => {
  let onSpy: jest.SpyInstance;
  let fastify: any;

  beforeEach(() => {
    fastify = createFastifyMock();
    onSpy = jest.spyOn(process, 'on');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should register signal and error handlers', () => {
    setupGracefulShutdown(fastify);
    // SIGTERM, SIGINT, uncaughtException, unhandledRejection
    expect(onSpy).toHaveBeenCalledTimes(4);
    expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    // Ensure no shutdown is triggered during handler registration
    expect(fastify.close).not.toHaveBeenCalled();
  });
});

describe('setupGracefulShutdown error handlers', () => {
  let fastify: any;
  let exitSpy: jest.SpyInstance;
  let handlers: Record<string, Function>;

  beforeEach(() => {
    fastify = createFastifyMock();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    handlers = {};
    jest.spyOn(process, 'on').mockImplementation((event, handler) => {
      handlers[event.toString()] = handler;
      return process;
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should handle uncaughtException and exit 1', () => {
    setupGracefulShutdown(fastify);
    const error = new Error('uncaught!');
    handlers.uncaughtException(error);
    expect(fastify.log.error).toHaveBeenCalledWith('Uncaught Exception:', error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle unhandledRejection and exit 1', () => {
    setupGracefulShutdown(fastify);
    const reason = new Error('promise fail');
    const promise = Promise.reject(reason);
    handlers.unhandledRejection(reason, promise);
    promise.catch(() => {}); // Prevent unhandled rejection
    expect(fastify.log.error).toHaveBeenCalledWith('Unhandled Rejection at:', promise, 'reason:', reason);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
