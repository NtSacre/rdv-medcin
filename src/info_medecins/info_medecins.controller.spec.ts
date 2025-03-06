import { Test, TestingModule } from '@nestjs/testing';
import { InfoMedecinsController } from './info_medecins.controller';

describe('InfoMedecinsController', () => {
  let controller: InfoMedecinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoMedecinsController],
    }).compile();

    controller = module.get<InfoMedecinsController>(InfoMedecinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
