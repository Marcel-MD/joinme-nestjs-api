import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Profile } from 'src/profile/profile.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Role } from './role.enum';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  @Exclude()
  password: string;

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  roles: Role[];

  @ApiProperty()
  @Column()
  creationDate: Date;

  @ApiProperty()
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
