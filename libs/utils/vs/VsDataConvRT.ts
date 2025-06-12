import { VsDataConvProp } from 'libs/vo/vs/VsDataConvProp';
import { TreeNode } from './TreeNode';

/**
 * !!! ATTENTION !!!
 * DO NOT MODIFY ANY CHARACTERS IN THIS FILE.
 */
export class VsDataConvRT {
  // the following field can reference vsDataCovertUtil.class

  // tile part tree node
  private treeNode: TreeNode;

  // key is tree part(target) leaf node id, value is tile part(source) leaf node id
  private leafNodeIdMap: Map<string, string>;
  private treePartId2LeafNodeMap: Map<string, VsDataConvProp>;
  private tilePartId2LeafNodeMap: Map<string, TreeNode>;

  constructor() {
    this.leafNodeIdMap = new Map();
    this.treePartId2LeafNodeMap = new Map();
    this.tilePartId2LeafNodeMap = new Map();
  }
}
