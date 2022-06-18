import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Profile {
  @ApiProperty()
  @PrimaryColumn()
  id: number;

  @ApiProperty()
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column()
  userId: number;

  @ApiProperty()
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty()
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty()
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty()
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactInfo: string;

  @ApiProperty()
  @Column({ nullable: true })
  creationDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  updateDate: Date;

  @ApiProperty()
  @ManyToMany(() => User)
  @JoinTable()
  subscribers: User[];
}
