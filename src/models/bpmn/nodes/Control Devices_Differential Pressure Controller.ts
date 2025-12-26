import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId';
import dpcSvg from '@/assets/icons/Control Devices_Differential Pressure Controller.svg';
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema';

interface DPCProps {
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

class DPCModel extends RectNodeModel {
  static extendKey = 'DPCModel';
  static formSchema: FieldSchema[] = [
    ...baseFields, 
    ...controlFields,
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } // ✅ 新增备注框
  ];

  declare properties: DPCProps;

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `DPC_${getBpmnId()}`;
    super(data, gm);
    this.width = this.width || 96;
    this.height = this.height || 56;
    if (this.text) this.text.editable = true;
  }

  initNodeData(data: any) {
    super.initNodeData(data);
    const defaults: DPCProps = {
      deviceName: 'Differential Pressure Controller',
      deviceNameEn: 'Differential Pressure Controller',
      productModel: 'ABB DPC100',
      installDate: '2024-05-12',
      note: '',
      controlFunc: '压差阈值控制',
      responseTime: '5ms',
      interfaceType: '数字 I/O',
      commMethod: 'Modbus',
      powerSupply: '24 VDC',
    };
    this.properties = { ...defaults, ...(data.properties || {}) };
  }
}

class DPCView extends RectNode {
  static extendKey = 'DPCNode';

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
        href: dpcSvg,
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

export default { type: 'bpmn:differentialPressureController', view: DPCView, model: DPCModel };
export { DPCModel, DPCView };
