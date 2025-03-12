import { Test, TestingModule } from '@nestjs/testing';
import { SpecialiteController } from './specialite.controller';
import { SpecialiteService } from './specialite.service';

describe('SpecialiteController', () => {
  let controller: SpecialiteController;
  let service: SpecialiteService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialiteController],
      providers: [
        {
          provide: SpecialiteService, 
          useValue: {
            createSpecialite: jest.fn(),
            findAllSpecialites: jest.fn(),
            findOneSpecialite: jest.fn(),
            updateSpecialite: jest.fn(),
            removeSpecialite: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SpecialiteController>(SpecialiteController);
    service = module.get<SpecialiteService>(SpecialiteService);
 
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
});
