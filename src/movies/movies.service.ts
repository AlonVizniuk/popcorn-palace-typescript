import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { ConflictException, NotFoundException} from '@nestjs/common';


@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(movie: Partial<Movie>): Promise<Movie> {
    try {
      if (movie.rating !== undefined) {
        movie.rating = Math.round(movie.rating * 10) / 10;
      }
  
      return await this.movieRepository.save(movie);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException(`A movie with title "${movie.title}" already exists.`);
      }
      throw error;
    }
  }
  

  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find();
  }

  async update(title: string, updatedMovie: Partial<Movie>): Promise<Movie | null> {
    const movie = await this.movieRepository.findOne({ where: { title } });
    if (!movie){
          throw new NotFoundException(`Movie with title "${title}" not found.`);
    }
  
    if (updatedMovie.rating !== undefined) {
      updatedMovie.rating = Math.round(updatedMovie.rating * 10) / 10;
    }
  
    Object.assign(movie, updatedMovie);
  
    try {
      return await this.movieRepository.save(movie);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException(`A movie with title "${updatedMovie.title}" already exists.`);
      }
      throw error;
    }
  }

  async remove(title: string): Promise<void> {
    const result = await this.movieRepository.delete({ title });
    if (result.affected === 0) {
      throw new NotFoundException(`Movie with title "${title}" not found.`);
    }
  }

}
