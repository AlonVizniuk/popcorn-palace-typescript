import {Body, Controller, Post, UsePipes, ValidationPipe, HttpCode} from '@nestjs/common';
  import { TicketsService } from './tickets.service';
  import { CreateTicketsDto } from './dto/create-tickets.dto';
  
  @Controller('bookings')
  export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}
  
    @Post()
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    async bookTicket(@Body() dto: CreateTicketsDto) {
      return this.ticketsService.bookTicket(dto);
    }
  }
  