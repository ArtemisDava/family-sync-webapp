import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionLogsService } from './connection_logs.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConnectionLog } from './entities/connection_log.entity';
import { ObjectId } from 'mongodb';

describe('ConnectionLogsService', () => {
  let service: ConnectionLogsService;
  let connectionModel: any;

  const mockConnectionLog = {
    _id: '507f1f77bcf86cd799439011',
    userId: new ObjectId(),
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockConnectionModel = jest.fn(() => ({
    ...mockConnectionLog,
    save: jest.fn().mockResolvedValue(mockConnectionLog),
  }));

  Object.assign(mockConnectionModel, {
    aggregate: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionLogsService,
        { provide: getModelToken(ConnectionLog.name), useValue: mockConnectionModel },
      ],
    }).compile();

    service = module.get<ConnectionLogsService>(ConnectionLogsService);
    connectionModel = module.get(getModelToken(ConnectionLog.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a connection log', async () => {
      const userId = new ObjectId();
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      const result = await service.create(userId, ipAddress, userAgent);

      expect(result).toBeDefined();
    });
  });

  describe('getTotalConnectionsByMonth', () => {
    it('should return aggregated connection data', async () => {
      const mockAggregateResult = [
        { _id: { year: 2026, month: 1 }, totalConnections: 100 },
        { _id: { year: 2026, month: 2 }, totalConnections: 150 },
      ];

      connectionModel.aggregate.mockResolvedValue(mockAggregateResult);

      const result = await service.getTotalConnectionsByMonth();

      expect(result).toEqual(mockAggregateResult);
      expect(connectionModel.aggregate).toHaveBeenCalled();
    });

    it('should return empty array when no data', async () => {
      connectionModel.aggregate.mockResolvedValue([]);

      const result = await service.getTotalConnectionsByMonth();

      expect(result).toEqual([]);
    });
  });
});
