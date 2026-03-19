import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JdService } from './jd.service';
import {
  GenerateJdDto,
  SuggestSkillsDto,
  CheckQualityDto,
  SaveJdDto,
  SuggestReqQualDto,
  RefineJdDto,
} from './dto/jd.dto';

@Controller('jd')
export class JdController {
  constructor(private readonly jdService: JdService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateJD(@Body() dto: GenerateJdDto) {
    return this.jdService.generateJD(dto);
  }

  @Post('suggest-skills')
  @HttpCode(HttpStatus.OK)
  suggestSkills(@Body() dto: SuggestSkillsDto) {
    return this.jdService.suggestSkills(dto);
  }

  @Post('suggest-req-qual')
  @HttpCode(HttpStatus.OK)
  suggestReqQual(@Body() dto: SuggestReqQualDto) {
    return this.jdService.suggestReqQual(dto);
  }

  @Post('check-quality')
  @HttpCode(HttpStatus.OK)
  checkQuality(@Body() dto: CheckQualityDto) {
    return this.jdService.checkQuality(dto);
  }

  @Post('refine')
  @HttpCode(HttpStatus.OK)
  refineJD(@Body() dto: RefineJdDto) {
    return this.jdService.refineJD(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  saveJD(@Body() dto: SaveJdDto, @Request() req) {
    return this.jdService.saveJD(dto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('saved')
  getSavedJDs(@Request() req) {
    return this.jdService.getSavedJDs(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('saved/:id')
  getSavedJDById(@Param('id') id: string, @Request() req) {
    return this.jdService.getSavedJDById(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('saved/:id')
  @HttpCode(HttpStatus.OK)
  deleteJD(@Param('id') id: string, @Request() req) {
    return this.jdService.deleteJD(id, req.user.id);
  }
}
