export enum VsPortTypeEnum {
  INPUT_PORT = 'INPUT_PORT',
  OUTPUT_PORT = 'OUTPUT_PORT',
}

export enum VsHttpMethodEnum {
  GET = 'GET',
  POST = 'POST',
}

// 为了支持枚举值的描述，我们可以创建一个辅助映射
export const VsHttpMethodDescription: Record<VsHttpMethodEnum, string> = {
  [VsHttpMethodEnum.GET]: 'GET',
  [VsHttpMethodEnum.POST]: 'POST',
};

export enum VsPortReqHeaderMetaOpTypeEnum {
  DELETE = 'DELETE',
  SET = 'SET',
}

// 为了支持枚举值的描述，我们可以创建一个辅助映射
export const VsPortReqHeaderMetaOpTypeDescription: Record<
  VsPortReqHeaderMetaOpTypeEnum,
  string
> = {
  [VsPortReqHeaderMetaOpTypeEnum.DELETE]: '删除',
  [VsPortReqHeaderMetaOpTypeEnum.SET]: '设置',
};

export enum VsPortRspHeaderMetaOpTypeEnum {
  DELETE = 'DELETE',
  SET = 'SET',
}

// 为了支持枚举值的描述，我们可以创建一个辅助映射
export const VsPortRspHeaderMetaOpTypeDescription: Record<
  VsPortRspHeaderMetaOpTypeEnum,
  string
> = {
  [VsPortRspHeaderMetaOpTypeEnum.DELETE]: '删除',
  [VsPortRspHeaderMetaOpTypeEnum.SET]: '设置',
};
