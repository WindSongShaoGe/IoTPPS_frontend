// pipe-types.ts

// 1️⃣ 管道类型声明
export type PipeTypes =
  | 'Connection_Galvanized Steel Pipe'
  | 'Connection_PVC Water Supply Pipe'
  | 'Connection_PE Pipeline'
  | 'Connection_Plastic Hose'
  | 'Connection_Stainless Steel Corrugated Pipe'
  | 'Connection_Large-Diameter Pipeline'
  | 'Connection_Small-Diameter Pipeline'

// 2️⃣ 使用和节点一样的 import 方式
import galvanized from '@/assets/pipes/Connection_Galvanized Steel Pipe.svg'
import pvc from '@/assets/pipes/Connection_PVC Water Supply Pipe.svg'
import pe from '@/assets/pipes/Connection_PE Pipeline.svg'
import plastic from '@/assets/pipes/Connection_Plastic Hose.svg'
import corrugated from '@/assets/pipes/Connection_Stainless Steel Corrugated Pipe.svg'
import large from '@/assets/pipes/Connection_Large-Diameter Pipeline.svg'
import small from '@/assets/pipes/Connection_Small-Diameter Pipeline.svg'

// 3️⃣ 贴图映射
export const PIPE_TEXTURES: Record<PipeTypes, string> = {
  'Connection_Galvanized Steel Pipe': galvanized,
  'Connection_PVC Water Supply Pipe': pvc,
  'Connection_PE Pipeline': pe,
  'Connection_Plastic Hose': plastic,
  'Connection_Stainless Steel Corrugated Pipe': corrugated,
  'Connection_Large-Diameter Pipeline': large,
  'Connection_Small-Diameter Pipeline': small,
}

//（可选）文字标签
export const PIPE_LABEL: Record<PipeTypes, string> = {
  'Connection_Galvanized Steel Pipe': '镀锌钢管',
  'Connection_PVC Water Supply Pipe': 'PVC 给水管',
  'Connection_PE Pipeline': 'PE 管',
  'Connection_Plastic Hose': '塑料软管',
  'Connection_Stainless Steel Corrugated Pipe': '不锈钢波纹管',
  'Connection_Large-Diameter Pipeline': '大口径管道',
  'Connection_Small-Diameter Pipeline': '小口径管道',
}
