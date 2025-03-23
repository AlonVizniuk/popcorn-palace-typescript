import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './tickets.entity';
import { Showtime } from '../showtimes/showtime.entity';
import { CreateTicketsDto } from './dto/create-tickets.dto';

describe('TicketsService', () => {
  let service: TicketsService;
  let bookingRepo: Partial<Repository<Booking>>;
  let showtimeRepo: Partial<Repository<Showtime>>;

  beforeEach(async () => {
    bookingRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 1 } as Booking)),
      save: jest.fn(),
    };

    showtimeRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingRepo,
        },
        {
          provide: getRepositoryToken(Showtime),
          useValue: showtimeRepo,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should successfully book a ticket', async () => {
    const dto: CreateTicketsDto = {
      showtimeId: 1,
      seatNumber: 5,
      userId: '123e4567-e89b-12d3-a456-426614174000',
    };

    (showtimeRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (bookingRepo.save as jest.Mock).mockResolvedValue({ ...dto });

    const result = await service.bookTicket(dto);

    expect(result).toHaveProperty('bookingId');
    expect(typeof result.bookingId).toBe('string');
  });

  it('should throw if showtime is not found', async () => {
    const dto: CreateTicketsDto = {
      showtimeId: 999,
      seatNumber: 10,
      userId: '123e4567-e89b-12d3-a456-426614174000',
    };

    (showtimeRepo.findOne as jest.Mock).mockResolvedValue(undefined);

    await expect(service.bookTicket(dto)).rejects.toThrow(`Showtime with ID ${dto.showtimeId} not found`);
  });

  it('should throw if seat is already booked', async () => {
    const dto: CreateTicketsDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: '123e4567-e89b-12d3-a456-426614174000',
    };

    (showtimeRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });

    const error = new Error();
    error['code'] = 'SQLITE_CONSTRAINT';
    (bookingRepo.save as jest.Mock).mockRejectedValue(error);

    await expect(service.bookTicket(dto)).rejects.toThrow(`Seat ${dto.seatNumber} is already booked for showtime ${dto.showtimeId}`);
  });
});
