import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepo: Partial<Repository<Movie>>;

  beforeEach(async () => {
    movieRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: movieRepo,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should create a movie successfully', async () => {
    const movie = {
      title: 'Inception',
      genre: 'Sci-Fi',
      duration: 148,
      rating: 8.8,
      releaseYear: 2010,
    };

    movieRepo.save = jest.fn().mockResolvedValue({ ...movie, id: 1 });

    const result = await service.create(movie);
    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Inception');
  });

  it('should throw if movie title already exists', async () => {
    const movie = {
      title: 'Inception',
      genre: 'Sci-Fi',
      duration: 148,
      rating: 8.8,
      releaseYear: 2010,
    };

    const constraintError = new Error();
    constraintError['code'] = 'SQLITE_CONSTRAINT';
    movieRepo.save = jest.fn().mockRejectedValue(constraintError);

    await expect(service.create(movie)).rejects.toThrow(`A movie with title "${movie.title}" already exists.`);
  });

  it('should return all movies', async () => {
    const mockMovies = [
      { id: 1, title: 'Inception', genre: 'Sci-Fi', duration: 148, rating: 8.8, releaseYear: 2010 },
      { id: 2, title: 'Interstellar', genre: 'Sci-Fi', duration: 169, rating: 8.6, releaseYear: 2014 },
    ];    
    movieRepo.find = jest.fn().mockResolvedValue(mockMovies);

    const result = await service.findAll();
    expect(result.length).toBe(2);
  });

  it('should update a movie by title', async () => {
    const updated = {
      title: 'Inception',
      genre: 'Action',
      duration: 150,
      rating: 9.2,
      releaseYear: 2011,
    };

    movieRepo.findOne = jest.fn().mockResolvedValue(updated);
    movieRepo.save = jest.fn().mockResolvedValue(updated);

    const result = await service.update('Inception', updated);
    expect(result.genre).toBe('Action');
    expect(result.rating).toBe(9.2);
  });

  it('should delete a movie by title', async () => {
    movieRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });

    const result = await service.remove('Inception');
    expect(result).toBeUndefined();
  });

  it('should throw if movie to delete is not found', async () => {
    const title = 'FakeMovie';
    movieRepo.delete = jest.fn().mockResolvedValue({ affected: 0 });

    await expect(service.remove('FakeMovie')).rejects.toThrow(`Movie with title "${title}" not found.`);
  });
});
