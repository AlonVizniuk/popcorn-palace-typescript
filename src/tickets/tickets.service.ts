import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './tickets.entity';
import { CreateTicketsDto } from './dto/create-tickets.dto';
import { v4 as uuidv4 } from 'uuid';
import { Showtime } from '../showtimes/showtime.entity';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepo: Repository<Booking>,

        @InjectRepository(Showtime)
        private readonly showtimeRepo: Repository<Showtime>,
    ) { }

    async bookTicket(dto: CreateTicketsDto): Promise<{ bookingId: string }> {
        const showtime = await this.showtimeRepo.findOne({
            where: { id: dto.showtimeId },
        });

        if (!showtime) {
            throw new NotFoundException(
                `Showtime with ID ${dto.showtimeId} not found`,
            );
        }

        const bookingId = uuidv4();

        const booking = this.bookingRepo.create({
            ...dto,
            bookingId,
        });

        try {
            await this.bookingRepo.save(booking);
            return { bookingId };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new ConflictException(
                    `Seat ${dto.seatNumber} is already booked for showtime ${dto.showtimeId}`,
                );
            }

            throw new InternalServerErrorException('Booking failed unexpectedly');
        }
    }
}
