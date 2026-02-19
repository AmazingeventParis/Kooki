import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FundraisersService } from './fundraisers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('fundraisers')
export class FundraisersController {
  constructor(private readonly fundraisersService: FundraisersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser('id') userId: string, @Body() body: unknown) {
    const fundraiser = await this.fundraisersService.create(userId, body);
    return {
      data: fundraiser,
      message: 'Cagnotte creee avec succes',
    };
  }

  @Get()
  async findActive(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.fundraisersService.findActive(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
    return result;
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.fundraisersService.findMine(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
    return result;
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const fundraiser = await this.fundraisersService.findBySlug(slug);
    return {
      data: fundraiser,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const fundraiser = await this.fundraisersService.update(userId, id, body);
    return {
      data: fundraiser,
      message: 'Cagnotte mise a jour',
    };
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard)
  async pause(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const fundraiser = await this.fundraisersService.pause(userId, id);
    return {
      data: fundraiser,
      message: 'Cagnotte mise en pause',
    };
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard)
  async resume(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const fundraiser = await this.fundraisersService.resume(userId, id);
    return {
      data: fundraiser,
      message: 'Cagnotte reprise',
    };
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard)
  async close(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const fundraiser = await this.fundraisersService.close(userId, id);
    return {
      data: fundraiser,
      message: 'Cagnotte fermee',
    };
  }
}
