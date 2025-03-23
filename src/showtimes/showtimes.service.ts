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
        await this.validateShowtime(dto);
        const showtime = this.showtimeRepo.create(dto);
        return this.showtimeRepo.save(showtime);
    }

    async update(id: number, dto: CreateShowtimeDto): Promise<Showtime> {
        const existing = await this.showtimeRepo.findOne({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Showtime with ID ${id} not found`);
        }

        await this.validateShowtime(dto, id);

        Object.assign(existing, dto);
        return this.showtimeRepo.save(existing);
    }

    private async validateShowtime(dto: CreateShowtimeDto, skipId?: number): Promise<void> {
        const movie = await this.movieRepo.findOne({ where: { id: dto.movieId } });
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${dto.movieId} not found`);
        }

        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);

        if (end <= start) {
            throw new BadRequestException('endTime must be after startTime');
        }

        const duration = (end.getTime() - start.getTime()) / 60000;
        if (duration < movie.duration) {
            throw new BadRequestException(
                `Showtime duration (${duration} min) is less than movie duration (${movie.duration} min)`
            );
        }

        const showtimes = await this.showtimeRepo.find({
            where: { theater: dto.theater },
        });

        const overlaps = showtimes.some((s) => {
            if (s.id === skipId) return false;
            const sStart = new Date(s.startTime);
            const sEnd = new Date(s.endTime);
            return !(sEnd <= start || sStart >= end);
        });

        if (overlaps) {
            throw new ConflictException(
                `Another showtime already exists in "${dto.theater}" that overlaps with ${dto.startTime} - ${dto.endTime}`
            );
        }

        if (dto.price <= 0) {
            throw new BadRequestException('Price must be greater than 0');
        }

        dto.price = Math.round(dto.price * 10) / 10;
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
