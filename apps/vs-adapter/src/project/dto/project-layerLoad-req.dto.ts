import { VsPortTypeEnum } from '@prisma/client';
import { VsApiTypeEnum } from '@app/enum//data.mapping.enum';
import {
  VsNodeTaskTypeEnum,
  VsNodeViewTypeEnum,
  VsVirtualNodeTypeEnum,
} from '@app/enum//node.enum';
import { VsLinkProp } from '../../link/entities/link.prop.entity';
import { VsNodeProp } from '../../node/entities/node.prop.entity';
import { VsPortProp } from '../../port/dto/VsPortProp';

export class RouteDefinitionRespDto {
  // @ApiProperty({ description: '节点ID' })
  id: string;

  // @ApiProperty({ description: '属性', type: VsNodeProp })
  properties: VsNodeProp;

  // @ApiProperty({ description: '节点任务类型', enum: VsNodeTaskTypeEnum })
  taskType: VsNodeTaskTypeEnum;

  // @ApiProperty({ description: '节点视图类型', enum: VsNodeViewTypeEnum })
  viewType: VsNodeViewTypeEnum;

  // @ApiProperty({ description: '上层节点ID' })
  upLevelNodeId: string;

  // @ApiProperty({ description: '边', type: [LinkRespDto] })
  links: LinkRespDto[];

  // @ApiProperty({ description: '端口', type: [PortRespDto] })
  ports: PortRespDto[];

  // @ApiProperty({ description: '节点', type: [VsNodeRespDto] })
  nodes: VsNodeRespDto[];
}

export class VsNodeRespDto {
  // @ApiProperty({ description: '节点ID' })
  id: string;

  // @ApiProperty({ description: '节点任务类型', enum: VsNodeTaskTypeEnum })
  taskType: VsNodeTaskTypeEnum;

  // @ApiProperty({ description: '节点视图类型', enum: VsNodeViewTypeEnum })
  viewType: VsNodeViewTypeEnum;

  // @ApiProperty({ description: '上层节点ID' })
  upLevelNodeId: string;

  // @ApiProperty({ description: '属性', type: VsNodeProp })
  properties: VsNodeProp;

  // @ApiProperty({ description: '是否是虚拟节点' })
  virtual: boolean;

  // @ApiProperty({ description: '虚拟节点类型', enum: VsVirtualNodeTypeEnum })
  virtualType: VsVirtualNodeTypeEnum;

  // @ApiProperty({ description: '虚拟节点序' })
  order: number = -1;

  // @ApiProperty({ description: '端口', type: [PortRespDto] })
  ports: PortRespDto[];
}

export class VsProjectLayerLoadResp {
  //  @ApiProperty({ description: '项目ID' })
  id: number;

  //  @ApiProperty({ description: '项目名字' })
  name: string;

  //  @ApiProperty({
  //   description: '一层图上的原子节点数据',
  //   type: [EndpointDefinitionRespDto],
  // })
  endpointDefinitions: EndpointDefinitionRespDto[];

  // @ApiProperty({ description: '一层图上的边', type: [LinkRespDto] })
  links: LinkRespDto[];

  // @ApiProperty({
  //   description: '一层图上的复合节点数据',
  //   type: [RouteDefinitionRespDto],
  // })
  routeDefinitions: RouteDefinitionRespDto[];
}

export class EndpointDefinitionRespDto {
  // @ApiProperty({ description: '节点ID' })
  id: string;

  // @ApiProperty({ description: '节点任务类型', enum: VsNodeTaskTypeEnum })
  taskType: VsNodeTaskTypeEnum;

  // @ApiProperty({ description: '节点视图类型', enum: VsNodeViewTypeEnum })
  viewType: VsNodeViewTypeEnum;

  // @ApiProperty({ description: '上层节点ID' })
  upLevelNodeId: string;

  // @ApiProperty({ description: '属性', type: VsNodeProp })
  properties: VsNodeProp;

  // @ApiProperty({ description: '端口', type: [PortRespDto] })
  ports: PortRespDto[];
}

export class PortRespDto {
  // @ApiProperty({ description: '端口ID' })
  id: string;

  // @ApiProperty({ description: '节点ID' })
  nodeId: string;

  // @ApiProperty({ description: '端口类型', enum: VsPortTypeEnum })
  type: VsPortTypeEnum;

  // @ApiProperty({ description: '源接口类型', enum: VsApiTypeEnum })
  sourceApiType: VsApiTypeEnum;

  // @ApiProperty({ description: '目标接口类型', enum: VsApiTypeEnum })
  targetApiType: VsApiTypeEnum;

  // @ApiProperty({ description: '源接口ID' })
  sourceApiId: number;

  // @ApiProperty({ description: '目标接口ID' })
  targetApiId: number;

  // @ApiProperty({ description: '属性', type: VsPortProp })
  properties: VsPortProp;
}

export class LinkRespDto {
  // @ApiProperty({ description: '边ID' })
  id: string;

  // @ApiProperty({ description: '节点开始ID' })
  sourceId: string;

  // @ApiProperty({ description: '节点结束ID' })
  targetId: string;

  // @ApiProperty({ description: '端口开始ID' })
  sourcePort: string;

  // @ApiProperty({ description: '端口结束ID' })
  targetPort: string;

  // @ApiProperty({ description: '属性', type: VsLinkProp })
  properties: VsLinkProp;
}
