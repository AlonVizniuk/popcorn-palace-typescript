import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';
import { UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';


@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() movie: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(movie);
  }  

  @Get()
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Post('/update/:movieTitle')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async update(
    @Param('movieTitle') movieTitle: string,
    @Body() updatedMovie: CreateMovieDto,
  ): Promise<void> {
    await this.moviesService.update(movieTitle, updatedMovie);
  }

  @Delete(':movieTitle')
  @HttpCode(200)
  async remove(@Param('movieTitle') movieTitle: string): Promise<void> {
    await this.moviesService.remove(movieTitle);
  }

}
