import { Test, TestingModule } from '@nestjs/testing';
import { SupportTeamsMsController } from './support-teams-ms.controller';
import { SupportTeamsMsService } from './support-teams-ms.service';

describe('SupportTeamsMsController', () => {
  let supportTeamsMsController: SupportTeamsMsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SupportTeamsMsController],
      providers: [SupportTeamsMsService],
    }).compile();

    supportTeamsMsController = app.get<SupportTeamsMsController>(SupportTeamsMsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(supportTeamsMsController.getHello()).toBe('Hello World!');
    });
  });
});
