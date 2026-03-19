import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobDescription } from './entities/jd.entity';
import {
  GenerateJdDto,
  SuggestSkillsDto,
  CheckQualityDto,
  SaveJdDto,
  SuggestReqQualDto,
  RefineJdDto,
} from './dto/jd.dto';

@Injectable()
export class JdService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectRepository(JobDescription)
    private readonly jdRepository: Repository<JobDescription>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({model: 'gemini-2.5-flash'});
    }
  }

  async generateJD(dto: GenerateJdDto): Promise<{ generatedJD: string; variants: { label: string; jd: string }[] }> {
    if (!this.model) {
      throw new InternalServerErrorException(
        'Gemini API key not configured. Please set GEMINI_API_KEY in .env',
      );
    }

    const skillsList = dto.skills?.length
      ? dto.skills.join(', ')
      : 'To be determined';

    const roleBlock = `ROLE DETAILS:
- Job Title: ${dto.jobTitle}
- Company: ${dto.company || 'Our Company'}
- Location: ${dto.location || 'Location not specified'}
- Experience Required: ${dto.experience || 'Relevant experience required'}
- Employment Type: ${dto.jobType || 'Full-time'}
- Work Arrangement: ${dto.workMode || 'On-site'}
- Salary / CTC: ${dto.salaryRange || 'Competitive, based on experience'}
- Department: ${dto.department || 'Not specified'}
- Key Skills: ${skillsList}
- Core Responsibilities: ${dto.responsibilities || 'As per role requirements'}
- Qualifications: ${dto.qualifications || 'Relevant degree and professional experience'}`;

    const sections = `Generate a structured job description with ALL of these plain-text sections:

About the Company
(2-3 sentences about culture and mission)

Role Overview
(3-4 sentences about role impact and purpose)

Key Responsibilities
(8-10 bullet points starting with •)

Required Skills and Qualifications
(6-8 bullet points starting with •)

Preferred Skills
(4-5 nice-to-have bullet points starting with •)

What We Offer
(5-6 benefits as bullet points starting with •)

Work Details
Location: [value] | Type: [value] | Mode: [value] | Experience: [value] | Salary: [value]

Use plain text only. Do NOT use markdown symbols like ** or ##. Use • for all bullet points.`;

    const tones = [
      {
        label: '🎯 Formal',
        instruction: 'Write in a formal, corporate, and authoritative tone. Be direct, precise, and professional. Suitable for established companies and senior roles.',
      },
      {
        label: '🚀 Engaging',
        instruction: 'Write in an energetic, enthusiastic, and candidate-friendly tone. Use inclusive language, highlight growth opportunities, and make the role sound exciting. Suitable for startups and modern companies.',
      },
      {
        label: '⚡ Concise',
        instruction: 'Write in a concise, to-the-point tone. Keep each section brief but complete. Avoid filler words. Ideal for busy candidates who scan JDs quickly.',
      },
    ];

    try {
      const results = await Promise.all(
        tones.map(async (tone) => {
          const prompt = `You are a senior HR professional and expert technical recruiter. ${tone.instruction}

${roleBlock}

${sections}`;
          const result = await this.model.generateContent(prompt);
          return { label: tone.label, jd: result.response.text() };
        }),
      );

      return {
        generatedJD: results[0].jd, // default to first for backward compat
        variants: results,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate JD: ${error.message}`,
      );
    }
  }

  async refineJD(dto: RefineJdDto): Promise<{ refinedJD: string }> {
    if (!this.model) {
      throw new InternalServerErrorException('Gemini API key not configured');
    }

    const prompt = `You are a senior HR expert. A recruiter has provided an existing job description and wants you to refine it based on their specific instruction.

EXISTING JOB DESCRIPTION:
${dto.currentJD}

RECRUITER'S INSTRUCTION:
${dto.instruction}

Rules:
- Apply the recruiter's instruction precisely and professionally to the job description.
- Preserve the original structure and all sections (About the Company, Role Overview, Key Responsibilities, Required Skills, Preferred Skills, What We Offer, Work Details).
- Do NOT add markdown symbols like ** or ##. Use plain text only.
- Use • for all bullet points.
- Return only the refined job description text, nothing else — no explanations, no notes, no preamble.`;

    try {
      const result = await this.model.generateContent(prompt);
      const refinedJD = result.response.text();
      return { refinedJD };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to refine JD: ${error.message}`,
      );
    }
  }

  async suggestSkills(
    dto: SuggestSkillsDto,
  ): Promise<{ skills: string[] }> {
    if (!this.model) {
      throw new InternalServerErrorException('Gemini API key not configured');
    }

    const existingText = dto.existingSkills?.length
      ? dto.existingSkills.join(', ')
      : 'None';
    const expContext = dto.experience
      ? `Experience Level: ${dto.experience}`
      : '';

    const prompt = `You are an expert technical recruiter. Suggest additional relevant skills for this job role.

Job Title: ${dto.jobTitle}
${expContext}
Already Listed Skills: ${existingText}

Suggest 10-12 additional skills NOT already listed. Tailor them to the experience level:
- Junior: focus on foundational technologies, core frameworks, and basic tooling
- Mid-Level: include mid-tier tools, patterns, collaboration tools, and some architecture knowledge
- Senior: include system design, advanced tools, performance, cloud, and architecture patterns
- Lead: include system architecture, team leadership, mentoring, project planning, and strategic technologies

Include a mix of technical and soft skills appropriate for the level.

Return ONLY a valid JSON array of strings. Example:
["Spring Boot", "Docker", "REST APIs", "PostgreSQL", "Git", "Agile", "Team Leadership"]

Return just the JSON array, no explanation or markdown.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      
      if (jsonMatch) {
         try {
           const skills: string[] = JSON.parse(jsonMatch[0]);
           return { skills: skills.slice(0, 12) };
         } catch (parseErr) {
           // Fallback if AI returns slightly malformed JSON (like trailing commas)
           console.warn('Malformed JSON array from AI, falling back to regex extraction.');
           const itemMatch = jsonMatch[0].match(/"([^"]+)"/g);
           if (itemMatch) {
             const skills = itemMatch.map(s => s.replace(/"/g, '').trim()).filter(Boolean);
             return { skills: skills.slice(0, 12) };
           }
         }
      }
      return { skills: [] };
    } catch (error) {
      console.error('Error suggesting skills:', error);
      throw new InternalServerErrorException(
        `Failed to suggest skills: ${error.message}`,
      );
    }
  }

  async suggestReqQual(dto: SuggestReqQualDto): Promise<{ responsibilities: string; qualifications: string }> {
    if (!this.model) {
      throw new InternalServerErrorException('Gemini API key not configured');
    }

    const skillsContext = dto.skills?.length ? `Required Skills: ${dto.skills.join(', ')}` : '';
    const expContext = dto.experience ? `Experience Level: ${dto.experience}` : '';

    const prompt = `You are an expert HR writer. Draft the "Responsibilities" and "Qualifications" sections for the following job role.

Job Title: ${dto.jobTitle}
${expContext}
${skillsContext}

Create professional and realistic bullet points.

Return ONLY a valid JSON object strictly matching this format:
{
  "responsibilities": "• Point 1\\n• Point 2\\n• Point 3",
  "qualifications": "• Qual 1\\n• Qual 2\\n• Qual 3"
}

Do not add markdown formatting around the JSON. Use "\\n" for newlines in the string values. Use "• " to start each point. Provide around 6-8 bullet points for responsibilities and 4-6 for qualifications.`;

    try {
      const result = await this.model.generateContent(prompt);
      let text = result.response.text().trim();
      
      // Strip markdown code blocks if the AI maliciously added them despite instructions
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }

      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
         try {
           const parsed = JSON.parse(jsonMatch[0]);
           return {
             responsibilities: parsed.responsibilities || '',
             qualifications: parsed.qualifications || ''
           };
         } catch(parseErr) {
           console.warn('Malformed JSON object from AI in suggestReqQual:', parseErr.message);
         }
      }
      return { responsibilities: '', qualifications: '' };
    } catch (error) {
      console.error('Error suggesting responsibilities and qualifications:', error);
      throw new InternalServerErrorException(
        `Failed to suggest details: ${error.message}`,
      );
    }
  }

  async checkQuality(
    dto: CheckQualityDto,
  ): Promise<{ score: number; grade: string; suggestions: string[] }> {
    if (!this.model) {
      throw new InternalServerErrorException('Gemini API key not configured');
    }

    const prompt = `You are a JD quality expert. Analyze this job description and provide a quality score.

JOB DESCRIPTION:
${dto.generatedJD}

Evaluate based on: completeness, clarity, specificity, professional tone, structure, and candidate appeal.

Return ONLY a valid JSON object:
{
  "score": <integer 0-100>,
  "grade": "<Excellent|Good|Fair|Poor>",
  "suggestions": ["actionable suggestion 1", "suggestion 2", "suggestion 3"]
}

Score guide: 90-100=Excellent, 75-89=Good, 60-74=Fair, below 60=Poor.
Provide 3-5 specific, actionable suggestions. Return just the JSON, nothing else.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(100, Math.max(0, parsed.score || 70)),
          grade: parsed.grade || 'Good',
          suggestions: parsed.suggestions || [],
        };
      }
      return {
        score: 70,
        grade: 'Good',
        suggestions: ['Could not analyze quality at this time.'],
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to check quality: ${error.message}`,
      );
    }
  }

  async saveJD(dto: SaveJdDto, userId: string): Promise<JobDescription> {
    try {
      const jd = this.jdRepository.create({ ...dto, userId });
      return await this.jdRepository.save(jd);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to save JD: ${error.message}`,
      );
    }
  }

  async getSavedJDs(userId: string): Promise<JobDescription[]> {
    return this.jdRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'jobTitle',
        'company',
        'location',
        'experience',
        'jobType',
        'workMode',
        'qualityScore',
        'skills',
        'createdAt',
      ],
    });
  }

  async getSavedJDById(id: string, userId: string): Promise<JobDescription> {
    const jd = await this.jdRepository.findOne({ where: { id, userId } });
    if (!jd) throw new NotFoundException(`JD with ID ${id} not found`);
    return jd;
  }

  async deleteJD(id: string, userId: string): Promise<{ message: string }> {
    const jd = await this.jdRepository.findOne({ where: { id, userId } });
    if (!jd) throw new NotFoundException(`JD with ID ${id} not found`);
    await this.jdRepository.delete(id);
    return { message: 'Job description deleted successfully' };
  }
}
