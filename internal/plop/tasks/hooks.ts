// plop生成 Hooks 执行脚本
import { camelize, getPascal, validateKebabCase } from '../utils'

const options = {
  description: '新建一个 Hooks',
  prompts: [
    {
      type: 'list',
      name: 'frame',
      default: 'vue',
      choices: ['vue', 'react'],
      message: '提供你的框架',
    },
    {
      type: 'input',
      name: 'name',
      message: '提供你的组件名称(使用 kebab-case)',
      validate: v => validateKebabCase(v),
    },
    {
      type: 'confirm',
      name: 'isCreate',
      default: true,
      message: '请确认是否创建?',
    },
  ],
  actions: (data) => {
    const { frame, name } = data // form-item
    const camelName = camelize(name) // formItem
    const pascalName = getPascal(name) // FormItem

    const actions = [
      {
        type: 'add',
        path: `packages/shared/hooks/${frame}/${name}.ts`,
        templateFile: 'internal/plop/tasks/api/hbs/ts.hbs',
        data: {
          name,
          camelName,
          pascalName,
        },
      },
    ]

    return actions
  },
}

export const setHooks = plop => plop.setGenerator('hooks', options)
