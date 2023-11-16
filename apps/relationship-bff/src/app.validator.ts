import { ApiProperty } from '@nestjs/swagger';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';
import { Support } from 'apps/support-teams-ms/src/support-teams.interface';
import { IsString, IsNotEmpty } from 'class-validator';

export class NewSolicitation {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class NewSupport {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class SupportDTO implements Support {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Array<Solicitation> })
  @IsString()
  @IsNotEmpty()
  processingSolicitations: Array<Solicitation>;
}
