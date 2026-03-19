import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JdController } from './jd.controller';
import { JdService } from './jd.service';
import { JobDescription } from './entities/jd.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobDescription])],
  controllers: [JdController],
  providers: [JdService],
})
export class JdModule {}
