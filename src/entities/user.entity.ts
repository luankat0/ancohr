import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { Company } from './company.entity';

export enum UserType {
  CANDIDATE = 'CANDIDATE',
  COMPANY = 'COMPANY',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserType,
    })
    userType: UserType;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => Candidate, (candidate) => candidate.user, { cascade: true })
    candidate?: Candidate;

    @OneToOne(() => Company, (company) => company.user, { cascade: true })
    company?: Company;
}