import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class GenerateJdDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() experience?: string;
  @IsOptional() @IsString() jobType?: string;
  @IsOptional() @IsString() workMode?: string;
  @IsOptional() @IsString() salaryRange?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsArray() skills?: string[];
  @IsOptional() @IsString() responsibilities?: string;
  @IsOptional() @IsString() qualifications?: string;
}

export class SuggestSkillsDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsOptional() @IsString() experience?: string;
  @IsOptional() @IsArray() existingSkills?: string[];
}

export class SuggestReqQualDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsOptional() @IsString() experience?: string;
  @IsOptional() @IsArray() skills?: string[];
}

export class CheckQualityDto {
  @IsString()
  @IsNotEmpty()
  generatedJD: string;
}

export class RefineJdDto {
  @IsString()
  @IsNotEmpty()
  currentJD: string;

  @IsString()
  @IsNotEmpty()
  instruction: string;
}

export class SaveJdDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() experience?: string;
  @IsOptional() @IsString() jobType?: string;
  @IsOptional() @IsString() workMode?: string;
  @IsOptional() @IsString() salaryRange?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsArray() skills?: string[];
  @IsOptional() @IsString() responsibilities?: string;
  @IsOptional() @IsString() qualifications?: string;

  @IsString()
  @IsNotEmpty()
  generatedJD: string;

  @IsOptional() @IsNumber() qualityScore?: number;
  @IsOptional() @IsArray() qualitySuggestions?: string[];
}
