import SequenceFlow from '@logicflow/extension/es/bpmn/flow/SequenceFlow';
import Gateway from '@logicflow/extension/es/bpmn/gateways/ExclusiveGateway';

import { GraphData, ModelType } from 'logicflow-useapi';
import { adapterXmlIn, adapterXmlOut } from './adapter';
import {
  endIcon,
  gatewayIcon,
  serviceTaskIcon,
  startIcon,
  userTaskIcon,
  pumpIcon,
  backwashPumpIcon,
  cartridgeFilterIcon,
  chemicalDosingTankIcon,
  dosingPumpIcon,
  mixerIcon,
  motorizedValveIcon,
  RO_UnitIcon,
  staticMixerIcon,
  UF_UnitIcon,
  UV_DechlorinationIcon,
  waterPipelineIcon,
  waterTankIcon,
  chemicalDosingControllerIcon,
  dataLoggerIcon,
  differentialPressureControllerIcon,
  PLC_Icon,
  conductivityAnalyzerIcon,
  DPIT_Icon,
  flowTransmitterIcon,
  hardnessMeterOfWaterIcon,
  levelTransmitterIcon,
  ORP_AnalyzerIcon,
  pH_AnalyzerIcon,
  pressureMeterIcon,
  communicationProtocolIcon,
  dataTransmissionUnitIcon,
  wirelessCommunicationModuleIcon,
  motorIcon,
  relayIcon,
  solenoidValveIcon,
  cloudDatabaseIcon,
  dataVisualizationPlatformIcon,
  intelligentAnalyticsModuleIcon,
  remoteConsoleIcon
} from './icons';
import newData from './newdata.json';

import StartEvent from './nodes/StartEvent';
import EndEvent from './nodes/EndEvent';
import ServiceTask from './nodes/ServiceTask';
import UserTask from './nodes/UserTask';
import { theme } from './theme';

import MechatronicDevices_Pump from './nodes/Mechatronic Devices_Pump';
import MechatronicDevices_BackwashPump from './nodes/Mechatronic Devices_Backwash Pump';
import MechatronicDevices_CartridgeFilter from "./nodes/Mechatronic Devices_Cartridge Filter";
import MechatronicDevices_ChemicalDosingTank from "@/models/bpmn/nodes/Mechatronic Devices_Chemical Dosing Tank";
import MechatronicDevices_DosingPump from "@/models/bpmn/nodes/Mechatronic Devices_Dosing Pump";
import MechatronicDevices_Mixer from "@/models/bpmn/nodes/Mechatronic Devices_Mixer";
import MechatronicDevices_MotorizedValve from "@/models/bpmn/nodes/Mechatronic Devices_Motorized Valve";
import MechatronicDevices_ReverseOsmosisUnit from "@/models/bpmn/nodes/Mechatronic Devices_Reverse Osmosis Unit";
import MechatronicDevices_StaticMixer from "@/models/bpmn/nodes/Mechatronic Devices_Static Mixer";
import MechatronicDevices_UltrafiltrationUnit from "@/models/bpmn/nodes/Mechatronic Devices_Ultrafiltration Unit";
import MechatronicDevices_UltravioletDechlorination from "@/models/bpmn/nodes/Mechatronic Devices_Ultraviolet Dechlorination";
import MechatronicDevices_WaterPipeline from "@/models/bpmn/nodes/Mechatronic Devices_Water Pipeline";
import MechatronicDevices_WaterTank from "@/models/bpmn/nodes/Mechatronic Devices_Water Tank";

import ControlDevices_ChemicalDosingController from "@/models/bpmn/nodes/Control Devices_Chemical Dosing Controller";
import ControlDevices_DataLogger from "@/models/bpmn/nodes/Control Devices_Data Logger";
import ControlDevices_DifferentialPressureController from "@/models/bpmn/nodes/Control Devices_Differential Pressure Controller";
import ControlDevices_PLC from "@/models/bpmn/nodes/Control Devices_PLC";

import SensingDevices_ConductivityAnalyzer from "@/models/bpmn/nodes/Sensing Devices_Conductivity Analyzer";
import SensingDevices_DifferentialPressureIndicatingTransmitter from "@/models/bpmn/nodes/Sensing Devices_Differential Pressure Indicating Transmitter";
import SensingDevices_FlowTransmitter from "@/models/bpmn/nodes/Sensing Devices_Flow Transmitter";
import SensingDevices_HardnessMeterOfWater from "@/models/bpmn/nodes/Sensing Devices_Hardness Meter of Water";
import SensingDevices_LevelTransmitter from "@/models/bpmn/nodes/Sensing Devices_Level Transmitter";
import SensingDevices_ORPAnalyzer from "@/models/bpmn/nodes/Sensing Devices_ORP Analyzer";
import SensingDevices_PHAnalyzer from "@/models/bpmn/nodes/Sensing Devices_PH Analyzer";
import SensingDevices_PressureMeter from "@/models/bpmn/nodes/Sensing Devices_Pressure Meter";

import CommunicationDevices_CommunicationProtocolModule from "@/models/bpmn/nodes/Communication Devices_Communication Protocol Module";
import CommunicationDevices_DataTransmissionUnit from "@/models/bpmn/nodes/Communication Devices_Data Transmission Unit";
import CommunicationDevices_WirelessCommunicationModule from "@/models/bpmn/nodes/Communication Devices_Wireless Communication Module";

import ActuatingDevices_Motor from "@/models/bpmn/nodes/Actuating Devices_Motor";
import ActuatingDevices_Relay from "@/models/bpmn/nodes/Actuating Devices_Relay";
import ActuatingDevices_SolenoidValve from "@/models/bpmn/nodes/Actuating Devices_Solenoid Valve";

import CloudServe_CloudDatabase from "@/models/bpmn/nodes/Cloud Serve_Cloud Database";
import CloudServer_DataVisualizationPlatform from "@/models/bpmn/nodes/Cloud Server_Data Visualization Platform";
import CloudServer_IntelligentAnalyticsModule from "@/models/bpmn/nodes/Cloud Server_Intelligent Analytics Module";
import CloudServer_RemoteConsole from "@/models/bpmn/nodes/Cloud Server_Remote Console";

const key = 'bpmn'

export default <ModelType>{
  name: key,
  label: 'BPMN 模型',
  defaultEdgeType: SequenceFlow.type,
  theme,
  adapters: {
    'default': {
      label: 'BPMN',
      extension: 'xml',
      in(src: string): GraphData {
        return {
          ...adapterXmlIn(src)
        }
      },
      out(data) {
        return adapterXmlOut(data)
      }
    }
  },
  nodeTypes: [
    {
      ...StartEvent,
      type: 'bpmn:startEvent',
      label: '开始',
      icon: startIcon
    },
    {
      ...EndEvent,
      type: 'bpmn:endEvent',
      label: '结束',
      icon: endIcon
    },
    {
      ...UserTask,
      type: 'bpmn:userTask',
      label: '用户任务',
      icon: userTaskIcon
    },
    {
      ...ServiceTask,
      type: 'bpmn:serviceTask',
      label: '服务任务',
      icon: serviceTaskIcon
    },
    {
      ...Gateway,
      type: 'bpmn:exclusiveGateway',
      label: '互斥网关',
      icon: gatewayIcon
    },

    // ===== Mechatronic（统一 kebab-case type）=====
    {
      ...MechatronicDevices_Pump,
      type: 'bpmn:pump',
      label: '泵',
      icon: pumpIcon
    },
    {
      ...MechatronicDevices_BackwashPump,
      type: 'bpmn:backwash-pump',
      label: '反洗泵',
      icon: backwashPumpIcon
    },
    {
      ...MechatronicDevices_CartridgeFilter,
      type: 'bpmn:cartridge-filter',
      label: '滤芯过滤器',
      icon: cartridgeFilterIcon
    },
    {
      ...MechatronicDevices_ChemicalDosingTank,
      type: 'bpmn:chemical-tank',
      label: '药剂罐',
      icon: chemicalDosingTankIcon
    },
    {
      ...MechatronicDevices_DosingPump,
      type: 'bpmn:dosing-pump',
      label: '计量泵',
      icon: dosingPumpIcon
    },
    {
      ...MechatronicDevices_Mixer,
      type: 'bpmn:mixer',
      label: '混合器',
      icon: mixerIcon
    },
    {
      ...MechatronicDevices_MotorizedValve,
      type: 'bpmn:motorized-valve',
      label: '电动阀门',
      icon: motorizedValveIcon
    },
    {
      ...MechatronicDevices_ReverseOsmosisUnit,
      type: 'bpmn:reverse-osmosis-unit',
      label: '反渗透装置',
      icon: RO_UnitIcon
    },
    {
      ...MechatronicDevices_StaticMixer,
      type: 'bpmn:static-mixer',
      label: '静态混合器',
      icon: staticMixerIcon
    },
    {
      ...MechatronicDevices_UltrafiltrationUnit,
      type: 'bpmn:uf-unit',
      label: '超滤单元',
      icon: UF_UnitIcon
    },
    {
      ...MechatronicDevices_UltravioletDechlorination,
      type: 'bpmn:dechlorination-unit',
      label: '脱氯装置',
      icon: UV_DechlorinationIcon
    },
    {
      ...MechatronicDevices_WaterPipeline,
      type: 'bpmn:water-pipeline',
      label: '水管道',
      icon: waterPipelineIcon
    },
    {
      ...MechatronicDevices_WaterTank,
      type: 'bpmn:water-tank',
      label: '水箱',
      icon: waterTankIcon
    },

    // ===== Control =====
    {
      ...ControlDevices_ChemicalDosingController,
      type: 'bpmn:chemical-dosing-controller',
      label: '配药控制器',
      icon: chemicalDosingControllerIcon
    },
    {
      ...ControlDevices_DataLogger,
      type: 'bpmn:data-logger',
      label: '数据记录器',
      icon: dataLoggerIcon
    },
    {
      ...ControlDevices_DifferentialPressureController,
      type: 'bpmn:differential-pressure-controller',
      label: '压差控制器',
      icon: differentialPressureControllerIcon
    },
    {
      ...ControlDevices_PLC,
      type: 'bpmn:plc',
      label: 'PLC',
      icon: PLC_Icon
    },

    // ===== Sensing =====
    {
      ...SensingDevices_ConductivityAnalyzer,
      type: 'bpmn:conductivity-analyzer',
      label: '电导率分析仪',
      icon: conductivityAnalyzerIcon
    },
    {
      ...SensingDevices_DifferentialPressureIndicatingTransmitter,
      type: 'bpmn:differential-pressure-transmitter',
      label: '差压指示变送器',
      icon: DPIT_Icon
    },
    {
      ...SensingDevices_FlowTransmitter,
      type: 'bpmn:flow-transmitter',
      label: '流量变送器',
      icon: flowTransmitterIcon
    },
    {
      ...SensingDevices_HardnessMeterOfWater,
      type: 'bpmn:hardness-meter',
      label: '水硬度计',
      icon: hardnessMeterOfWaterIcon
    },
    {
      ...SensingDevices_LevelTransmitter,
      type: 'bpmn:level-transmitter',
      label: '液位变送器',
      icon: levelTransmitterIcon
    },
    {
      ...SensingDevices_ORPAnalyzer,
      type: 'bpmn:orp-analyzer',
      label: '氧化还原电位分析仪',
      icon: ORP_AnalyzerIcon
    },
    {
      ...SensingDevices_PHAnalyzer,
      type: 'bpmn:ph-analyzer',
      label: 'pH分析仪',
      icon: pH_AnalyzerIcon
    },
    {
      ...SensingDevices_PressureMeter,
      type: 'bpmn:pressure-meter',
      label: '液体压力计',
      icon: pressureMeterIcon
    },

    // ===== Communication =====
    {
      ...CommunicationDevices_CommunicationProtocolModule,
      type: 'bpmn:protocol-module',
      label: '通信协议模块',
      icon: communicationProtocolIcon
    },
    {
      ...CommunicationDevices_DataTransmissionUnit,
      type: 'bpmn:dtu-gateway',
      label: '数据采集网关',
      icon: dataTransmissionUnitIcon
    },
    {
      ...CommunicationDevices_WirelessCommunicationModule,
      type: 'bpmn:wireless-module',
      label: '无线通信模块',
      icon: wirelessCommunicationModuleIcon
    },

    // ===== Actuating =====
    {
      ...ActuatingDevices_Motor,
      type: 'bpmn:motor',
      label: '电机',
      icon: motorIcon
    },
    {
      ...ActuatingDevices_Relay,
      type: 'bpmn:relay',
      label: '继电器',
      icon: relayIcon
    },
    {
      ...ActuatingDevices_SolenoidValve,
      type: 'bpmn:solenoid-valve',
      label: '电磁阀',
      icon: solenoidValveIcon
    },

    // ===== Cloud =====
    {
      ...CloudServe_CloudDatabase,
      type: 'bpmn:cloud-database',
      label: '云数据库',
      icon: cloudDatabaseIcon
    },
    {
      ...CloudServer_DataVisualizationPlatform,
      type: 'bpmn:data-visualization-platform',
      label: '数据可视化平台',
      icon: dataVisualizationPlatformIcon
    },
    {
      ...CloudServer_IntelligentAnalyticsModule,
      type: 'bpmn:intelligent-analytics-module',
      label: '智能分析模块',
      icon: intelligentAnalyticsModuleIcon
    },
    {
      ...CloudServer_RemoteConsole,
      type: 'bpmn:remote-console',
      label: '远程控制台',
      icon: remoteConsoleIcon
    },
  ],
  edgeTypes: [
    SequenceFlow
  ],
  newData
}
