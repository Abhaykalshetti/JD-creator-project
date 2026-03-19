import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
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
  private openai: OpenAI;
  private readonly modelName = 'llama-3.1-8b-instant';

  constructor(
    @InjectRepository(JobDescription)
    private readonly jdRepository: Repository<JobDescription>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
  }

  async generateJD(dto: GenerateJdDto): Promise<{ generatedJD: string; variants: { label: string; jd: string }[] }> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'Groq API key not configured. Please set GROQ_API_KEY in .env',
      );
    }

    const skillsList = dto.skills?.length
      ? dto.skills.join(', ')
      : 'To be determined';


    const prompt = `You are a Senior HR Executive and Expert Technical Recruiter. Your task is to generate highly professional, structured Job Descriptions suitable for job portals.

### CONSTRAINTS
1. Ensure the JD is clear, concise, and professional.
2. Avoid overly generic descriptions; tailor it to the specific role.
3. Maintain consistent formatting. 
4. DO NOT include unrelated explanations, conversational filler, or preamble.
5. Provide the exact sections requested below.

### ROLE INPUTS
- Job Title: ${dto.jobTitle}
- Company: ${dto.company || 'Our Company'}
- Location: ${dto.location || 'Location not specified'}
- Employment Type: ${dto.jobType || 'Full-time'}
- Experience Required: ${dto.experience || 'Not specified'}
- Salary / CTC: ${dto.salaryRange || 'Not specified'}
- Required Skills: ${dto.skills?.join(', ') || 'Not specified'}
- Core Responsibilities: ${dto.responsibilities || 'As per standard industry requirements'}
- Qualifications: ${dto.qualifications || 'Relevant degree'}

### EXPECTED STRUCTURE
For each generated variant, include only plain text with these sections:
1. Job Title
2. Company Overview (2-3 sentences)
3. Job Summary
4. Key Responsibilities (6-8 bullet points using •)
5. Required Skills & Qualifications (bullet points using •)
6. Preferred Skills (optional, bullet points using •)
7. Work Details (Location, Type, Experience, Salary)
8. Benefits
9. Application Process

### INSTRUCTIONS
You must generate THREE versions of this job description based on the exact structure above, but varying the tone:
1. "🎯 Formal": Corporate, authoritative, direct, and highly professional.
2. "🚀 Engaging": Energetic, enthusiastic, candidate-friendly with inclusive language.
3. "⚡ Concise": To-the-point, brief, with no filler words. 

Return ONLY a strictly valid JSON object matching this format. Use "\\n" for all newlines within the "jd" string values. Do NOT use trailing backslashes for line continuation.
{
  "variants": [
    { "label": "🎯 Formal", "jd": "<formal text here>" },
    { "label": "🚀 Engaging", "jd": "<engaging text here>" },
    { "label": "⚡ Concise", "jd": "<concise text here>" }
  ]
}`;
 
    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      
      let text = response.choices[0].message.content?.trim() || '';
      
      // ── ROBUST JSON SANITIZATION ──
      text = this.sanitizeJson(text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      try {
        const parsedData = JSON.parse(text);
        
        // Handle cases where AI might wrap the array in a different key or return it directly
        const rawVariants = parsedData.variants || parsedData.results || (Array.isArray(parsedData) ? parsedData : []);
        
        if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
           // Fallback if variants is missing but generatedJD exists at top level
           const singleJD = parsedData.generatedJD || text;
           return {
             generatedJD: singleJD,
             variants: [{ label: '🎯 Formal', jd: singleJD }]
           };
        }

        // Map to ensure we have the correct keys (label, jd)
        const variants = rawVariants.map((v, i) => ({
          label: v.label || v.style || v.title || `Variant ${i + 1}`,
          jd: v.jd || v.content || v.text || '',
        })).filter(v => v.jd.trim().length > 0);

        return {
          generatedJD: variants[0]?.jd || '',
          variants: variants.length > 0 ? variants : [{ label: '🎯 Formal', jd: parsedData.generatedJD || '' }],
        };
      } catch (parseError) {
        console.error('JSON Parse Error in generateJD:', parseError.message, 'Raw text:', text);
        // Last resort fallback: if it's not JSON, treat the whole response as a single JD
        return {
          generatedJD: text,
          variants: [{ label: '🎯 Formal', jd: text }],
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate JD: ${error.message}`,
      );
    }
  }

  async refineJD(dto: RefineJdDto): Promise<{ refinedJD: string }> {
    if (!this.openai) {
      throw new InternalServerErrorException('Groq API key not configured');
    }

    const prompt = `You are a Senior HR Executive and Expert Technical Recruiter. Your task is to refine an existing Job Description based on specific instructions.

### CONSTRAINTS
1. Apply the recruiter's instruction precisely and professionally.
2. Preserve the original structure and all sections.
3. DO NOT add markdown symbols like ** or ##. Use plain text only.
4. Use • for all bullet points.
5. Return ONLY the refined job description text, nothing else — no explanations, no notes, no preamble.

### INPUTS
EXISTING JOB DESCRIPTION:
${dto.currentJD}

RECRUITER'S INSTRUCTION:
${dto.instruction}

### INSTRUCTIONS
Generate the updated job description incorporating all changes.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
      });
      const refinedJD = response.choices[0].message.content || '';
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
    if (!this.openai) {
      throw new InternalServerErrorException('Groq API key not configured');
    }

    const existingText = dto.existingSkills?.length
      ? dto.existingSkills.join(', ')
      : 'None';
    const expContext = dto.experience
      ? `Experience Level: ${dto.experience}`
      : '';

    const prompt = `You are a Senior HR Executive and Expert Technical Recruiter. Based on the job title and experience level provided, suggest additional relevant skills.

### CONSTRAINTS
1. Suggest 10-12 additional skills NOT already listed.
2. Tailor them specifically to the target experience level.
3. Include a mix of technical and soft skills.
4. Return ONLY a valid JSON array of strings. 
5. No explanations, no markdown code blocks, no preamble.

### INPUTS
- Job Title: ${dto.jobTitle}
- Experience Level: ${dto.experience || 'Not specified'}
- Already Listed Skills: ${existingText}

### EXPERIENCE LEVEL GUIDELINES
- Junior: foundational technologies, core frameworks, basic tooling.
- Mid-Level: mid-tier tools, design patterns, collaboration tools.
- Senior: system design, performance optimization, cloud architecture.
- Lead: team leadership, mentoring, strategic technology planning.

### EXPECTED FORMAT
["Skill 1", "Skill 2", "Skill 3", ...]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
      });
      let text = response.choices[0].message.content?.trim() || '';
      text = this.sanitizeJson(text);
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
    if (!this.openai) {
      throw new InternalServerErrorException('Groq API key not configured');
    }

    const skillsContext = dto.skills?.length ? `Required Skills: ${dto.skills.join(', ')}` : '';
    const expContext = dto.experience ? `Experience Level: ${dto.experience}` : '';

    const prompt = `You are a Senior HR Executive and Expert Technical Recruiter. Draft the detailed "Responsibilities" and "Qualifications" sections for a job role.

### CONSTRAINTS
1. Create professional and realistic bullet points starting with "• ".
2. Use "\\n" for newlines in the string values.
3. Provide 6-8 bullet points for responsibilities and 4-6 for qualifications.
4. Return ONLY a valid JSON object. 
5. No markdown formatting, no preamble.

### INPUTS
- Job Title: ${dto.jobTitle}
- Experience Level: ${dto.experience || 'Not specified'}
- Required Skills: ${dto.skills?.join(', ') || 'Not specified'}

### EXPECTED JSON FORMAT
{
  "responsibilities": "• Responsibility 1\\n• Responsibility 2",
  "qualifications": "• Qualification 1\\n• Qualification 2"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      let text = response.choices[0].message.content?.trim() || '';
      // Sanitize potential invalid escapes
      text = this.sanitizeJson(text);
      
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
    if (!this.openai) {
      throw new InternalServerErrorException('Groq API key not configured');
    }

    const prompt = `You are a JD quality expert. Analyze the provided job description and provide a quality evaluation.

### EVALUATION CRITERIA
- Completeness, clarity, and specificity.
- Professional tone and appeal to candidates.
- Structure and formatting.

### CONSTRAINTS
1. Return ONLY a valid JSON object.
2. Score must be between 0 and 100.
3. Grade must be one of: Excellent, Good, Fair, Poor.
4. Provide 3-5 specific, actionable suggestions.
5. No preamble, no markdown code blocks.

### INPUT
JOB DESCRIPTION:
${dto.generatedJD}

### EXPECTED JSON FORMAT
{
  "score": 85,
  "grade": "Good",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      let text = response.choices[0].message.content?.trim() || '';
      text = this.sanitizeJson(text);
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

  private sanitizeJson(text: string): string {
    return text
      .replace(/\\\n/g, '\\n') // Fix trailing backslashes followed by literal newlines
      .replace(/\\\r\n/g, '\\n') // Fix Windows-style newlines
      .replace(/\\"/g, '"')      // Fix over-escaped quotes occasionally seen
      .replace(/"\s*:\s*"([^"]*)"/g, (match, p1) => {
        // Ensure literal newlines inside string values are escaped
        return `": "${p1.replace(/\n/g, '\\n')}"`;
      });
  }
}
