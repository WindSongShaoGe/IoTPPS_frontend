import { CircleNode } from '@logicflow/core'
import { StartEventModel as OldModel } from '@logicflow/extension/es/bpmn/events/StartEvent'

// 解决 logic-flow 提供的图形符号不符合 BPMN 规范的问题
class StartEventModel extends OldModel {
  // static extendKey = 'StartEventModel';

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.strokeWidth = 2   // StartEvent 边框比 EndEvent 更细
    return style
  }

  setAttributes(): void {
    this.r = 17  // 半径与 EndEvent 保持一致
  }
}

class StartEventView extends CircleNode {
  static extendKey = 'StartEventView';
}

const StartEvent = {
  type: 'bpmn:startEvent',
  view: StartEventView,
  model: StartEventModel,
}

export { StartEventView, StartEventModel }
export default StartEvent
