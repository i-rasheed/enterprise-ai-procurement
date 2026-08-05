import { AuditAction } from '@prisma/client';

import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';

describe('AuditService', () => {
  const createMock = jest.fn().mockResolvedValue({ id: 'audit-1' });
  const recordLoginAttemptMock = jest
    .fn()
    .mockResolvedValue({ id: 'attempt-1' });

  const repository = {
    create: createMock,
    recordLoginAttempt: recordLoginAttemptMock,
  } as unknown as AuditRepository;

  const infoMock = jest.fn();
  const pinoLogger = {
    setContext: jest.fn(),
    info: infoMock,
  };

  const service = new AuditService(repository, pinoLogger as never);

  beforeEach(() => jest.clearAllMocks());

  it('logs audit events', async () => {
    await service.log({
      action: AuditAction.AUTH_LOGIN,
      userId: 'user-1',
      organisationId: 'org-1',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.AUTH_LOGIN }),
    );
    expect(infoMock).toHaveBeenCalled();
  });

  it('records login attempts', async () => {
    await service.recordLoginAttempt('test@example.com', false, '127.0.0.1');
    expect(recordLoginAttemptMock).toHaveBeenCalledWith(
      'test@example.com',
      false,
      '127.0.0.1',
      undefined,
    );
  });
});
