import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  saveJD(@Body() dto: SaveJdDto) {
    return this.jdService.saveJD(dto);
  }

  @Get('saved')
  getSavedJDs() {
    return this.jdService.getSavedJDs();
  }

  @Get('saved/:id')
  getSavedJDById(@Param('id') id: string) {
    return this.jdService.getSavedJDById(id);
  }

  @Delete('saved/:id')
  @HttpCode(HttpStatus.OK)
  deleteJD(@Param('id') id: string) {
    return this.jdService.deleteJD(id);
  }
}
