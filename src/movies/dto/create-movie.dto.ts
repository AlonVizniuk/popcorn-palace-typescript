import {
    IsString,
    IsInt,
    IsNumber,
    Min,
    Max,
    Matches,
  } from 'class-validator';
  
  export class CreateMovieDto {
    @IsString()
    title: string;
  
    @IsString()
    genre: string;
  
    @IsInt()
    duration: number;
  
    @IsNumber()
    @Min(0)
    @Max(10)
    rating: number;
  
    @IsInt()
    @Min(1900)
    @Max(2100)
    releaseYear: number;

  }
  