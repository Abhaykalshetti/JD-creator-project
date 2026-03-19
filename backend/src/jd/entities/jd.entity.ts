import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('job_descriptions')
export class JobDescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  jobTitle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  experience: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jobType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  workMode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salaryRange: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  generatedJD: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  qualityScore: number;

  @Column({ type: 'simple-array', nullable: true })
  qualitySuggestions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
