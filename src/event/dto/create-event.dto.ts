import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, Length } from 'class-validator';

export class CreateEventDto {

  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  @IsString()
  @Length(1, 60)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(1, 300)
  description: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  category: string;
}
