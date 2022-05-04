import { mkdir } from 'fs/promises'
import { parallel, series } from 'gulp'
import { runTask, withTaskName } from './src/utils/gulp'
import { run } from './src/utils/process'
import { buildOutput } from './src/config/paths'

// gulp 不打包只做代码转化 使用它做流程控制

// 拷贝源码
// const copySourceCode = () => async () => {
//   await run(`cp ${uiRoot}/package.json ${buildOutput}/package.json`)
// }

/**
 * 1. 打包样式
 * 2. 打包工具方法
 * 3. 打包所有组件
 * 4. 打包每个组件
 * 5. 生成一个组件库
 * 6. 发布组件
 */
export default series(
  // 删除dist目录
  withTaskName('clean', () => run('pnpm run clear:dist')),
  // 新建输出目录
  withTaskName('mkdir', () => mkdir(buildOutput, { recursive: true })),
  parallel(
    // 执行build命令时会调用rollup，给rollup传参数buildComponent，那么就会执行导出任务叫buildComponent
    runTask('buildModules'),
    runTask('genTypes'),
  ),
)

export * from './src'
