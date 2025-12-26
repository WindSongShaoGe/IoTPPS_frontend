import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core';
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId';
import dosingSvg from '@/assets/icons/Control Devices_Chemical Dosing Controller.svg';
import { baseFields, controlFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema';

interface DosingControllerProps {
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

class DosingControllerModel extends RectNodeModel {
  static extendKey = 'DosingControllerModel';

  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...controlFields.map(f => ({ ...f, disabled: true, readOnly: true })),
      { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' } // ✅ 新增备注框

  ];

  properties: DosingControllerProps;

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `DCS_${getBpmnId()}`;
    super(data, gm);
    this.width = this.width || 96;
    this.height = this.height || 56;

    this.properties = this.getInitialProperties(data.properties);
  }

  private getInitialProperties(userProps?: Partial<DosingControllerProps>): DosingControllerProps {
    const defaults: DosingControllerProps = {
      deviceName: 'Chemical Dosing Controller',
      deviceNameEn: 'Chemical Dosing Controller',
      productModel: 'Prominent DULCO',
      installDate: '2024-05-12',
      note: '',
      controlFunc: '加药流量控制',
      responseTime: '10ms',
      interfaceType: '数字 I/O',
      commMethod: 'Modbus',
      powerSupply: '24 VDC',
    };
    return { ...defaults, ...userProps };
  }
}

class DosingControllerView extends RectNode {
  static extendKey = 'DosingControllerNode';

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
        href: dosingSvg,
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

export default { type: 'bpmn:chemicalDosingController', view: DosingControllerView, model: DosingControllerModel };
export { DosingControllerModel, DosingControllerView };