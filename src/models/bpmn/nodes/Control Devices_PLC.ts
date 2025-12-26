import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId';
import plcSvg from '@/assets/icons/Control Devices_PLC.svg';
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema';

interface PlcProps {
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

class PlcModel extends RectNodeModel {
  static extendKey = 'PlcModel';

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...controlFields.map(f => ({ ...f, disabled: true, readOnly: true })), // 全部字段只读
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } // ✅ 新增备注框

  ];

  properties: PlcProps;

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `PLC_${getBpmnId()}`;
    super(data, gm);
    this.width = this.width || 96;
    this.height = this.height || 56;

    // 初始化属性
    this.properties = this.getInitialProperties(data.properties);
  }

  private getInitialProperties(userProps?: Partial<PlcProps>): PlcProps {
    const defaults: PlcProps = {
      deviceName: 'PLC',
      deviceNameEn: 'PLC',
      productModel: 'Siemens S7-1200',
      installDate: '2024-05-12',
      note: '',
      controlFunc: '程序控制',
      responseTime: '2ms',
      interfaceType: '数字 I/O',
      commMethod: 'Modbus/TCP',
      powerSupply: '220 VAC',
    };
    return { ...defaults, ...userProps };
  }
}

class PlcView extends RectNode {
  static extendKey = 'PlcNode';

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
        href: plcSvg,
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

export default { type: 'bpmn:plc', view: PlcView, model: PlcModel };
export { PlcModel, PlcView };
