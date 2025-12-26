// src/models/index.ts
import type { ModelType } from 'logicflow-useapi'

import StartEvent from "@/models/bpmn/nodes/StartEvent";

// ---- 供 useModeler 选择的“模型清单” (默认导出) ----
import bpmnModel from './bpmn/model'

// ---- 这里收集“所有节点的定义”，命名导出 nodeDefs ----
import Motor from './bpmn/nodes/Actuating Devices_Motor'
import Relay from './bpmn/nodes/Actuating Devices_Relay'
import SolenoidValve from './bpmn/nodes/Actuating Devices_Solenoid Valve'
import CloudDB from './bpmn/nodes/Cloud Serve_Cloud Database'

import DataVizPlatform from './bpmn/nodes/Cloud Server_Data Visualization Platform'
import IntelligentAnalytics from './bpmn/nodes/Cloud Server_Intelligent Analytics Module'
import RemoteConsole from './bpmn/nodes/Cloud Server_Remote Console'
import ProtocolModule from './bpmn/nodes/Communication Devices_Communication Protocol Module'
import DTU from './bpmn/nodes/Communication Devices_Data Transmission Unit'
import WirelessModule from './bpmn/nodes/Communication Devices_Wireless Communication Module'
import ChemicalDosingController from './bpmn/nodes/Control Devices_Chemical Dosing Controller'
import DataLogger from './bpmn/nodes/Control Devices_Data Logger'

import DifferentialPressureController from './bpmn/nodes/Control Devices_Differential Pressure Controller'
import PLC from './bpmn/nodes/Control Devices_PLC'
import CustomImageNode from './bpmn/nodes/CustomImageNode'
import EndEvent from './bpmn/nodes/EndEvent'
import BackwashPump from './bpmn/nodes/Mechatronic Devices_Backwash Pump'
import CartridgeFilter from './bpmn/nodes/Mechatronic Devices_Cartridge Filter'
import ChemicalDosingTank from './bpmn/nodes/Mechatronic Devices_Chemical Dosing Tank'
import DosingPump from './bpmn/nodes/Mechatronic Devices_Dosing Pump'
import Mixer from './bpmn/nodes/Mechatronic Devices_Mixer'
import MotorizedValve from './bpmn/nodes/Mechatronic Devices_Motorized Valve'
import Pump from './bpmn/nodes/Mechatronic Devices_Pump'

import ReverseOsmosisUnit from './bpmn/nodes/Mechatronic Devices_Reverse Osmosis Unit'
import StaticMixer from './bpmn/nodes/Mechatronic Devices_Static Mixer'
import UltrafiltrationUnit from './bpmn/nodes/Mechatronic Devices_Ultrafiltration Unit'
import UltravioletDechlorination from './bpmn/nodes/Mechatronic Devices_Ultraviolet Dechlorination'
import WaterPipeline from './bpmn/nodes/Mechatronic Devices_Water Pipeline'
import WaterTank from './bpmn/nodes/Mechatronic Devices_Water Tank'
import ConductivityAnalyzer from './bpmn/nodes/Sensing Devices_Conductivity Analyzer'
import DPITransmitter from './bpmn/nodes/Sensing Devices_Differential Pressure Indicating Transmitter'
import FlowTransmitter from './bpmn/nodes/Sensing Devices_Flow Transmitter'

import HardnessMeter from './bpmn/nodes/Sensing Devices_Hardness Meter of Water'
import LevelTransmitter from './bpmn/nodes/Sensing Devices_Level Transmitter'
import ORPAnalyzer from './bpmn/nodes/Sensing Devices_ORP Analyzer'
import PHAnalyzer from './bpmn/nodes/Sensing Devices_PH Analyzer'

import PressureMeter from './bpmn/nodes/Sensing Devices_Pressure Meter'
import ServiceTask from './bpmn/nodes/ServiceTask'
import UserTask from './bpmn/nodes/UserTask'
import { wrapNodeWithValuePeek } from './bpmn/value-peek'

import nodeRedModel from './node-red/model'

// 命名导出：所有节点定义（给 index.vue 注册用）
export const nodeDefs = [
  Motor,
  Relay,
  SolenoidValve,
  ChemicalDosingController,
  DataLogger,
  DifferentialPressureController,
  PLC,
  ConductivityAnalyzer,
  DPITransmitter,
  FlowTransmitter,
  HardnessMeter,
  LevelTransmitter,
  ORPAnalyzer,
  PHAnalyzer,
  PressureMeter,
  MotorizedValve,
  UltrafiltrationUnit,
  UltravioletDechlorination,
  ReverseOsmosisUnit,
  CartridgeFilter,
  Mixer,
  DosingPump,
  Pump,
  WaterPipeline,
  WaterTank,
  ChemicalDosingTank,
  BackwashPump,
  StaticMixer,
  ProtocolModule,
  DTU,
  WirelessModule,
  CloudDB,
  DataVizPlatform,
  IntelligentAnalytics,
  RemoteConsole,
  StartEvent,
  EndEvent,
  ServiceTask,
  UserTask,
  CustomImageNode,
]

export const nodeDefsWithPeek = nodeDefs.map(wrapNodeWithValuePeek)

// 默认导出：供 useModeler 使用的模型清单
const models: ModelType[] = [bpmnModel, nodeRedModel]
export default models
