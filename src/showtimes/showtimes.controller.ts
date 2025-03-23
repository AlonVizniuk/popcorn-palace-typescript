import { Body, Controller, Post, UsePipes, ValidationPipe, Param, Get, Delete, HttpCode } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { Showtime } from './showtime.entity';

@Controller('showtimes')
export class ShowtimesController {
    constructor(private readonly showtimesService: ShowtimesService) { }

    @Post()
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    create(@Body() dto: CreateShowtimeDto): Promise<Showtime> {
        return this.showtimesService.create(dto);
    }

    @Post('/update/:id')
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    async update(
        @Param('id') id: number,
        @Body() dto: CreateShowtimeDto,
    ): Promise<void> {
        await this.showtimesService.update(id, dto);
    }

    @Get(':id')
    async getById(@Param('id') id: number) {
        const showtime = await this.showtimesService.findOneById(id);
        const { id: _removed, ...rest } = showtime;
        return rest;
    }


    @Delete(':id')
    @HttpCode(200)
    async delete(@Param('id') id: number): Promise<void> {
        return this.showtimesService.remove(id);
    }


}
