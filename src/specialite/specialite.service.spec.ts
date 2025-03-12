import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialiteService } from './specialite.service';
import { Specialite } from './specialite.entity';

describe('SpecialiteService', () => {
  let service: SpecialiteService;
  let repository: Repository<Specialite>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialiteService,
        {
          provide: getRepositoryToken(Specialite),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SpecialiteService>(SpecialiteService);
    repository = module.get<Repository<Specialite>>(getRepositoryToken(Specialite));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});