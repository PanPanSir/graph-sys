import { IsEnum } from 'class-validator';
import { VsCompileStatusEnum } from '@app/enum//project.enum';
import { Transform } from 'class-transformer';

export class CompileResultPropDto {
  @IsEnum(VsCompileStatusEnum)
  status: VsCompileStatusEnum;

  msg: string;

  @Transform(({ value }) => {
    if (value) {
      return new Date(value).toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return value;
  })
  requestCompileTime: Date;
}
