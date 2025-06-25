import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { VsLink } from '../entities/link.entity';
import { Transform } from 'class-transformer';

/**
 * 边添加请求DTO
 */
export class VsLinkAddReq {
  // @ApiProperty({ description: '边ID', minLength: 1, maxLength: 64 })
  @IsNotEmpty({ message: '边ID不能为空' })
  @IsString()
  @Length(1, 64, { message: '边ID在1到64个字符之间' })
  id: string;

  // @ApiProperty({ description: '项目ID' })
  @IsNotEmpty({ message: '项目ID不能为空' })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: '项目ID必须是数字' })
  projectId: number;

  // @ApiProperty({ description: '节点开始ID', minLength: 1, maxLength: 64 })
  @IsNotEmpty({ message: '节点开始ID不能为空' })
  @IsString()
  @Length(1, 64, { message: '节点开始ID在1到64个字符之间' })
  sourceId: string;

  // @ApiProperty({ description: '节点结束ID', minLength: 1, maxLength: 64 })
  @IsNotEmpty({ message: '节点结束ID不能为空' })
  @IsString()
  @Length(1, 64, { message: '节点结束ID在1到64个字符之间' })
  targetId: string;

  // @ApiProperty({ description: '端口开始ID', minLength: 1, maxLength: 64 })
  @IsNotEmpty({ message: '端口开始ID不能为空' })
  @IsString()
  @Length(1, 64, { message: '端口开始ID在1到64个字符之间' })
  sourcePort: string;

  // @ApiProperty({ description: '端口结束ID', minLength: 1, maxLength: 64 })
  @IsNotEmpty({ message: '端口结束ID不能为空' })
  @IsString()
  @Length(1, 64, { message: '端口结束ID在1到64个字符之间' })
  targetPort: string;

  properties: any;

  /**
   * 转换为VsLink实体
   */
  toVsLink(): VsLink {
    const vsLink = new VsLink();
    vsLink.id = this.id;
    vsLink.projectId = this.projectId;
    vsLink.sourceId = this.sourceId;
    vsLink.targetId = this.targetId;
    vsLink.sourcePort = this.sourcePort;
    vsLink.targetPort = this.targetPort;
    return vsLink;
  }
}
