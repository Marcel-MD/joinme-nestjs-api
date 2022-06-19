import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from "../enums/categoryEnum";
@Entity()
export class Event {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;
    
    @ApiProperty()
    @Column({ type: "float"})
    lat: number;

    @ApiProperty()
    @Column({type: "float"})
    lng: number;

    @ApiProperty()
    @Column()
    startTime: Date;

    @ApiProperty()
    @Column()
    endTime: Date;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @Column()
    address: string;

    @ApiProperty()
    @Column()
    category: Category;

    @ApiProperty()
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty()
    @Column()
    userId: number;

    @ApiProperty()
    @ManyToMany(() => User)
    @JoinTable()
    attendees: User[];
}
