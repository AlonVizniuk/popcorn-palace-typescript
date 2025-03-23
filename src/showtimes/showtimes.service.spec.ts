import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimesService } from './showtimes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.entity';
import { Movie } from '../movies/movie.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';

describe('ShowtimesService', () => {
  let service: ShowtimesService;
  let showtimeRepo: Partial<Repository<Showtime>>;
  let movieRepo: Partial<Repository<Movie>>;

  beforeEach(async () => {
    showtimeRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 1 } as Showtime)),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    movieRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: getRepositoryToken(Showtime),
          useValue: showtimeRepo,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: movieRepo,
        },
      ],
    }).compile();

    service = module.get<ShowtimesService>(ShowtimesService);
  });

  it('should create a showtime successfully', async () => {
    const dto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Main Hall',
      price: 50.0,
      startTime: '2025-04-01T15:00:00Z',
      endTime: '2025-04-01T18:00:00Z',
    };

    (movieRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, duration: 150 });
    (showtimeRepo.find as jest.Mock).mockResolvedValue([]);
    (showtimeRepo.save as jest.Mock).mockResolvedValue({ id: 99, ...dto });

    const result = await service.create(dto);
    expect(result).toMatchObject({ id: 99, ...dto });
  });

  it('should throw if endTime is before startTime', async () => {
    const dto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Main Hall',
      price: 50.0,
      startTime: '2025-04-01T18:00:00Z',
      endTime: '2025-04-01T15:00:00Z',
    };

    (movieRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, duration: 150 });

    await expect(service.create(dto)).rejects.toThrow('endTime must be after startTime');
  });

  it('should throw if showtime duration is shorter than movie duration', async () => {
    const dto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Main Hall',
      price: 50.0,
      startTime: '2025-04-01T15:00:00Z',
      endTime: '2025-04-01T16:00:00Z',
    };

    (movieRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, duration: 150 });

    await expect(service.create(dto)).rejects.toThrow('Showtime duration (60 min) is less than movie duration (150 min)');
  });

  it('should throw if overlapping showtime exists', async () => {
    const dto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Main Hall',
      price: 50.0,
      startTime: '2025-04-01T15:00:00Z',
      endTime: '2025-04-01T18:00:00Z',
    };

    const overlappingShowtime = {
      id: 99,
      startTime: '2025-04-01T14:30:00Z',
      endTime: '2025-04-01T16:30:00Z',
    };

    (movieRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, duration: 150 });
    (showtimeRepo.find as jest.Mock).mockResolvedValue([overlappingShowtime]);

    await expect(service.create(dto)).rejects.toThrow(
      `Another showtime already exists in "${dto.theater}" that overlaps with ${dto.startTime} - ${dto.endTime}`
    );
  });

  it('should throw if movie is not found', async () => {
    const dto: CreateShowtimeDto = {
      movieId: 999,
      theater: 'Main Hall',
      price: 50.0,
      startTime: '2025-04-01T15:00:00Z',
      endTime: '2025-04-01T18:00:00Z',
    };

    (movieRepo.findOne as jest.Mock).mockResolvedValue(undefined);

    await expect(service.create(dto)).rejects.toThrow(`Movie with ID ${dto.movieId} not found`);
  });

  it('should throw if price is zero or negative on update', async () => {
    const dto: CreateShowtimeDto = {
      movieId: 1,
      theater: 'Main Hall',
      price: 0,
      startTime: '2025-04-01T15:00:00Z',
      endTime: '2025-04-01T18:00:00Z',
    };
  
    const existingShowtime = {
      id: 1,
      theater: 'Main Hall',
      startTime: '2025-04-01T10:00:00Z',
      endTime: '2025-04-01T12:00:00Z',
      price: 50.0,
      movieId: 1,
    };
  
    (showtimeRepo.findOne as jest.Mock).mockResolvedValue(existingShowtime);
    (movieRepo.findOne as jest.Mock).mockResolvedValue({ id: 1, duration: 150 });
    (showtimeRepo.find as jest.Mock).mockResolvedValue([]);
  
    await expect(service.update(1, dto)).rejects.toThrow('Price must be greater than 0');
  });  

  it('should return the showtime if found', async () => {
    const mockShowtime = { id: 1, theater: 'Main Hall' } as Showtime;
    (showtimeRepo.findOne as jest.Mock).mockResolvedValue(mockShowtime);
  
    const result = await service.findOneById(1);
    expect(result).toBe(mockShowtime);
  });
  
  it('should throw if showtime is not found', async () => {
    (showtimeRepo.findOne as jest.Mock).mockResolvedValue(undefined);
  
    await expect(service.findOneById(999)).rejects.toThrow('Showtime with ID 999 not found');
  });
});