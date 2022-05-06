import { resolve } from 'path'

// 项目根目录
export const projectRoot = resolve(__dirname, '..', '..', '..')

/* plop */
// plop根目录
export const plopRoot = resolve(projectRoot, 'internal', 'plop')
// 任务目录
export const taskRoot = resolve(plopRoot, 'tasks')
// 模板目录
export const hbsRoot = resolve(plopRoot, 'hbs')
export const hbsComponent = resolve(hbsRoot, 'component')

/* output */
// 包目录
export const pkgRoot = resolve(projectRoot, 'packages')
// 包/组件目录
export const vueRoot = resolve(pkgRoot, 'vue')
export const vueComponents = resolve(vueRoot, 'src', 'components')
export const reactRoot = resolve(pkgRoot, 'react')
export const reactComponents = resolve(reactRoot, 'src', 'components')

/* 其他 */
// 包/共享
export const sharedRoot = resolve(pkgRoot, 'shared')
