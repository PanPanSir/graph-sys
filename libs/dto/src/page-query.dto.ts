import { IsNumber, IsOptional } from 'class-validator';

export class PageQueryDto {
  @IsNumber()
  @IsOptional()
  current: number = 1;

  @IsNumber()
  @IsOptional()
  size: number = 10;
}
