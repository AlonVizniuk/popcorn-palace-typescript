import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

let dataSource: DataSource;

describe('Popcorn Palace E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const dbPath = path.join(__dirname, '..', 'popcorn_palace.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should prevent duplicate movies added at the same moment', async () => {
    const moviePayload = {
      title: 'Duplicate Movie',
      genre: 'Action',
      duration: 120,
      rating: 8.5,
      releaseYear: 2024,
    };

    const [res1, res2] = await Promise.allSettled([
      request(app.getHttpServer()).post('/movies').send(moviePayload),
      request(app.getHttpServer()).post('/movies').send(moviePayload),
    ]);

    const statuses = [res1, res2].map((res) =>
      res.status === 'fulfilled' ? res.value.status : res.reason?.status
    );
    
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);
    
  });

  it('should prevent overlapping showtimes booked almost at the same moment', async () => {
    const movie = await request(app.getHttpServer()).post('/movies').send({
      title: 'Test Show Movie',
      genre: 'Drama',
      duration: 90,
      rating: 7.7,
      releaseYear: 2023,
    });
  
    const Id = movie.body.id;
    const payload = {
      movieId: Id,
      theater: 'Main Theater',
      startTime: '2025-07-01T15:00:00Z',
      endTime: '2025-07-01T17:00:00Z',
      price: 45.0,
    };
  
    const res1 = await request(app.getHttpServer())
      .post('/showtimes')
      .send(payload);
  
    await new Promise((resolve) => setTimeout(resolve, 10)); // ~10ms gap
  
    const res2 = await request(app.getHttpServer())
      .post('/showtimes')
      .send(payload);
  
    expect([res1.status, res2.status]).toContain(200); 
    expect([res1.status, res2.status]).toContain(409); 
  });
  

  it('should prevent double booking the same seat at the same showtime at the same moment', async () => {
    const movie = await request(app.getHttpServer()).post('/movies').send({
      title: 'Booking Movie',
      genre: 'Thriller',
      duration: 100,
      rating: 8.2,
      releaseYear: 2022,
    });

    const showtime = await request(app.getHttpServer()).post('/showtimes').send({
      movieId: movie.body.id,
      theater: 'Booking Hall',
      startTime: '2025-06-01T20:00:00Z',
      endTime: '2025-06-01T22:00:00Z',
      price: 50.0,
    });

    const showtimeId = showtime.body.id;

    const bookingPayload = {
      showtimeId,
      seatNumber: 5,
      userId: '111e4567-e89b-12d3-a456-426614174000',
    };

    const [res1, res2] = await Promise.allSettled([
      request(app.getHttpServer()).post('/bookings').send(bookingPayload),
      request(app.getHttpServer()).post('/bookings').send(bookingPayload),
    ]);

    const statuses = [res1, res2].map((res) =>
      res.status === 'fulfilled' ? res.value.status : res.reason?.status
    );
    
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);    
  });
});
