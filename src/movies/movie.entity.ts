import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['title'])
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;  //Unique

  @Column()
  genre: string;  

  @Column('int')
  duration: number;  // minutes

  @Column('float')
  rating: number;  // (0–10)

  @Column()
  releaseYear: number;  
}
