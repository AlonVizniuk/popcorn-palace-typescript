import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Movie } from '../movies/movie.entity';
  
  @Entity()
  export class Showtime {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Movie)
    @JoinColumn({ name: 'movieId' })
    movie: Movie;
  
    @Column()
    movieId: number;
  
    @Column()
    theater: string;
  
    @Column('datetime')
    startTime: Date;
  
    @Column('datetime')
    endTime: Date;
  
    @Column('float')
    price: number;
  }
  