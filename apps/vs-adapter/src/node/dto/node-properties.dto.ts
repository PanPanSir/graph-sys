import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class NodePropertiesDto {
  // @IsNotEmpty({ message: '节点id不能为空' })
  // @IsString()
  // id: string;

  @IsNotEmpty({ message: '节点名不能为空' })
  @Length(1, 64, { message: '节点名长度为1到64' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'x坐标不能为空' })
  @IsNumber()
  x: number;

  @IsNotEmpty({ message: 'y坐标不能为空' })
  @IsNumber()
  y: number;
}
