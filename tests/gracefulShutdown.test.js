import { expect } from 'chai';
import sinon from 'sinon';

import { gracefulShutdown, setupGracefulShutdown } from '../src/utils/gracefulShutdown.js';
import { cleanup, createFastifyMock } from './test.utils.js';

describe('gracefulShutdown', () => {
  let exit;
  let fastify;

  beforeEach(() => {
    fastify = createFastifyMock();
    exit = sinon.stub(process, 'exit');
  });

  afterEach(() => {
    cleanup();
  });

  it('should log shutdown and exit 0 on success', async () => {
    await gracefulShutdown(fastify, 'SIGTERM');
    expect(fastify.log.info.calledWith('Received SIGTERM. Starting graceful shutdown...')).to.be.true;
    expect(fastify.close.calledOnce).to.be.true;
    expect(fastify.log.info.calledWith('Server closed successfully')).to.be.true;
    expect(exit.calledWith(0)).to.be.true;
  });

  it('should log error and exit 1 on failure', async () => {
    const error = new Error('fail');
    fastify.close.rejects(error);
    await gracefulShutdown(fastify, 'SIGINT');
    expect(fastify.log.error.calledWith('Error during graceful shutdown:', error)).to.be.true;
    expect(exit.calledWith(1)).to.be.true;
    // Also check that info log for shutdown was called
    expect(fastify.log.info.calledWith('Received SIGINT. Starting graceful shutdown...')).to.be.true;
  });
});

describe('setupGracefulShutdown', () => {
  let on;
  let fastify;

  beforeEach(() => {
    fastify = createFastifyMock();
    on = sinon.stub(process, 'on');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should register signal and error handlers', () => {
    setupGracefulShutdown(fastify);
    // SIGTERM, SIGINT, uncaughtException, unhandledRejection
    expect(on.callCount).to.equal(4);
    expect(on.firstCall.args[0]).to.equal('SIGTERM');
    expect(on.secondCall.args[0]).to.equal('SIGINT');
    expect(on.thirdCall.args[0]).to.equal('uncaughtException');
    expect(on.getCall(3).args[0]).to.equal('unhandledRejection');
    // Ensure no shutdown is triggered during handler registration
    expect(fastify.close.notCalled).to.be.true;
  });
});

describe('setupGracefulShutdown error handlers', () => {
  let fastify;
  let exitStub;
  let handlers;

  beforeEach(() => {
    fastify = createFastifyMock();
    exitStub = sinon.stub(process, 'exit');
    handlers = {};
    sinon.stub(process, 'on').callsFake((event, handler) => {
      handlers[event] = handler;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should handle uncaughtException and exit 1', () => {
    setupGracefulShutdown(fastify);
    const error = new Error('uncaught!');
    handlers.uncaughtException(error);
    expect(fastify.log.error.calledWith('Uncaught Exception:', error)).to.be.true;
    expect(exitStub.calledWith(1)).to.be.true;
  });

  it('should handle unhandledRejection and exit 1', () => {
    setupGracefulShutdown(fastify);
    const reason = new Error('promise fail');
    const promise = Promise.reject(reason);
    handlers.unhandledRejection(reason, promise);
    expect(fastify.log.error.calledWith('Unhandled Rejection at:', promise, 'reason:', reason)).to.be.true;
    expect(exitStub.calledWith(1)).to.be.true;
  });
});
