import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  @Length(2, 25)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(3, 25)
  lastName: string;

  @ApiProperty()
  profilePicture: string;

  @ApiProperty()
  @IsString()
  @Length(25, 300)
  description: string;

  @ApiProperty()
  @IsString()
  @Length(8, 50)
  contactInfo: string;
}
