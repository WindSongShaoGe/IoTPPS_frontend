import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId';
import protoSvg from '@/assets/icons/Communication Devices_Communication Protocol Module.svg';
import { baseFields, commFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema';

interface ProtocolModuleProps {
  deviceName: string;
  deviceNameEn: string;
  productModel: string;
  installDate: string;
  note?: string; // ✅ 可选字段，避免初始化时报错
  protocols: string;
  interfaceType: string;
  commMethod: string;
  powerSupply: string;
}

class ProtocolModuleModel extends RectNodeModel {
  static extendKey = 'ProtocolModuleModel';

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...commFields,
    // ✅ 增加备注框
    {
      key: 'note',
      label: '备注',
      type: 'textarea',
      placeholder: '请输入备注信息',
      rows: 4
    }
  ];

  declare properties: ProtocolModuleProps;

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `PROTOCOL_${getBpmnId()}`;
    super(data, gm);
    this.width = this.width || 96;
    this.height = this.height || 56;
    if (this.text) this.text.editable = true;
  }

  initNodeData(data: any) {
    super.initNodeData(data);
    const defaults: ProtocolModuleProps = {
      deviceName: 'Protocol Module',
      deviceNameEn: 'Protocol Module',
      productModel: 'Moxa MGate MB3180',
      installDate: '2024-05-12',
      note: '多协议转换', // ✅ 初始化为空字符串
      protocols: 'Modbus TCP/RTU, Profibus, EtherNet/IP',
      interfaceType: 'RJ45/RS485',
      commMethod: '有线',
      powerSupply: '24 VDC'
    };
    this.properties = { ...defaults, ...(data.properties || {}) };
  }
}

class ProtocolModuleView extends RectNode {
  static extendKey = 'ProtocolModuleNode';

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
        'pointer-events': 'all'
      }),
      h('image', {
        href: protoSvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'none'
      })
    ]);
  }
}

export default { type: 'bpmn:protocolModule', view: ProtocolModuleView, model: ProtocolModuleModel };
export { ProtocolModuleModel, ProtocolModuleView };
