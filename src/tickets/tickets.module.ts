import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Booking } from './tickets.entity';
import { Showtime } from '../showtimes/showtime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Showtime])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
