import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { Movie } from '../movies/movie.entity';

@Injectable()
export class ShowtimesService {
    constructor(
        @InjectRepository(Showtime)
        private readonly showtimeRepo: Repository<Showtime>,

        @InjectRepository(Movie)
        private readonly movieRepo: Repository<Movie>,
    ) { }

    async create(dto: CreateShowtimeDto): Promise<Showtime> {
        const movie = await this.movieRepo.findOne({ where: { id: dto.movieId } });
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${dto.movieId} not found`);
        }

        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);

        if (end <= start) {
            throw new BadRequestException('endTime must be after startTime');
        }

        const actualDuration = (end.getTime() - start.getTime()) / 60000;
        if (actualDuration < movie.duration) {
            throw new BadRequestException(
                `Showtime duration (${actualDuration} min) is less than movie duration (${movie.duration} min)`,
            );
        }

        const existingShowtimes = await this.showtimeRepo.find({
            where: { theater: dto.theater },
        });

        const overlaps = existingShowtimes.some((existing) => {
            const existingStart = new Date(existing.startTime);
            const existingEnd = new Date(existing.endTime);
            return !(existingEnd <= start || existingStart >= end);
        });

        if (overlaps) {
            throw new ConflictException(
                `Another showtime already exists in "${dto.theater}" that overlaps with ${dto.startTime} - ${dto.endTime}`,
            );
        }

        if (dto.price <= 0) {
            throw new BadRequestException('Price must be greater than 0');
        }

        dto.price = Math.round(dto.price * 10) / 10;

        const showtime = this.showtimeRepo.create(dto);
        return this.showtimeRepo.save(showtime);
    }

    async update(id: number, dto: CreateShowtimeDto): Promise<Showtime> {
        const existingShowtime = await this.showtimeRepo.findOne({ where: { id } });
        if (!existingShowtime) {
            throw new NotFoundException(`Showtime with ID ${id} not found`);
        }

        const movie = await this.movieRepo.findOne({ where: { id: dto.movieId } });
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${dto.movieId} not found`);
        }

        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);

        if (end <= start) {
            throw new BadRequestException('endTime must be after startTime');
        }

        const actualDuration = (end.getTime() - start.getTime()) / 60000;
        if (actualDuration < movie.duration) {
            throw new BadRequestException(
                `Showtime duration (${actualDuration} min) is less than movie duration (${movie.duration} min)`,
            );
        }

        const updatedTheater = dto.theater;
        const otherShowtimes = await this.showtimeRepo.find({
            where: { theater: updatedTheater },
        });


        const overlaps = otherShowtimes.some((existing) => {
            if (Number(existing.id) === Number(id)) return false;
            const existingStart = new Date(existing.startTime);
            const existingEnd = new Date(existing.endTime);
            return !(existingEnd <= start || existingStart >= end);
        });

        if (overlaps) {
            throw new ConflictException(
                `Another showtime already exists in "${updatedTheater}" that overlaps with ${dto.startTime} - ${dto.endTime}`,
            );
        }

        if (dto.price <= 0) {
            throw new BadRequestException('Price must be greater than 0');
        }
        dto.price = Math.round(dto.price * 10) / 10;

        Object.assign(existingShowtime, dto);
        return this.showtimeRepo.save(existingShowtime);
    }

    async findOneById(id: number): Promise<Showtime> {
        const showtime = await this.showtimeRepo.findOne({ where: { id } });

        if (!showtime) {
            throw new NotFoundException(`Showtime with ID ${id} not found`);
        }

        return showtime;
    }

    async remove(id: number): Promise<void> {
        const result = await this.showtimeRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Showtime with ID ${id} not found`);
        }
    }
}
