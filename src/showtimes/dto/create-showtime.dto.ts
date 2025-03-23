import {
    IsInt,
    IsNumber,
    IsString,
    Min,
    Max,
    IsDateString,
  } from 'class-validator';
  
  export class CreateShowtimeDto {
    @IsInt()
    movieId: number;
  
    @IsString()
    theater: string;
  
    @IsDateString()
    startTime: string;  // Format: ISO 8601 (e.g. "2025-03-21T14:00:00Z")
  
    @IsDateString()
    endTime: string;
  
    @IsNumber()
    @Min(0)
    @Max(1000)
    price: number;
  }
  