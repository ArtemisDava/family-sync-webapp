import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionLogsService } from './connection_logs.service';

describe('ConnectionLogsService', () => {
  let service: ConnectionLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionLogsService],
    }).compile();

    service = module.get<ConnectionLogsService>(ConnectionLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
