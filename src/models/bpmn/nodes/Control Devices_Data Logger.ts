import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId';
import dlSvg from '@/assets/icons/Control Devices_Data Logger.svg';
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema';

interface DLProps {
  deviceName: string;
  deviceNameEn: string;
  productModel: string;
  installDate: string;
  note: string;
  controlFunc: string;
  responseTime: string;
  interfaceType: string;
  commMethod: string;
  powerSupply: string;
}

class DLModel extends RectNodeModel {
  static extendKey = 'DLModel';
  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...controlFields,
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } // ✅ 新增备注框
    ];

  declare properties: DLProps;

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `DL_${getBpmnId()}`;
    super(data, gm);
    this.width = this.width || 96;
    this.height = this.height || 56;
    if (this.text) this.text.editable = true;
  }

  initNodeData(data: any) {
    super.initNodeData(data);
    const defaults: DLProps = {
      deviceName: 'Data Logger',
      deviceNameEn: 'Data Logger',
      productModel: 'Yokogawa DX2000',
      installDate: '2024-05-12',
      note: '存储容量32G',
      controlFunc: '数据采集/存储',
      responseTime: '50ms',
      interfaceType: 'USB/485',
      commMethod: 'Modbus/TCP',
      powerSupply: '220 VAC',
    };
    this.properties = { ...defaults, ...(data.properties || {}) };
  }
}

class DLView extends RectNode {
  static extendKey = 'DLNode';

  getShape(): any {
    const { x, y, width, height, radius } = this.props.model;
    const style = this.props.model.getNodeStyle();
    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001,
      }),
      h('image', {
        href: dlSvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box',
      }),
    ]);
  }
}

export default { type: 'bpmn:dataLogger', view: DLView, model: DLModel };
export { DLModel, DLView };