import { Test, TestingModule } from '@nestjs/testing';
import { InfoMedecinsService } from './info_medecins.service';

describe('InfoMedecinsService', () => {
  let service: InfoMedecinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfoMedecinsService],
    }).compile();

    service = module.get<InfoMedecinsService>(InfoMedecinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
