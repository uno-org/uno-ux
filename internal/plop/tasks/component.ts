// plop生成组件执行脚本
import { PREFIX } from '../config/constants'
import { hbsComponent, reactComponents, vueComponents } from '../config/path'
import { camelize, getPascal, validateKebabCase } from '../utils'

const options = {
  description: '新建一个组件',
  prompts: [
    {
      type: 'list',
      name: 'frame',
      default: 'vue',
      choices: ['vue'],
      message: '提供你的框架',
    },
    {
      type: 'list',
      name: 'syntaxType',
      default: 'tsx',
      choices: ['tsx', 'vue'],
      message: '选择语法类型',
      when: (answers) => {
        return answers.frame === 'vue'
      },
    },
    {
      type: 'confirm',
      name: 'isTest',
      default: true,
      suffix: ' Yes',
      message: '是否需要测试?',
    },
    {
      type: 'checkbox',
      name: 'testType',
      message: '对应包请确认自行安装!',
      choices: [
        { name: 'unit (vitest)', value: 'unit', checked: true },
        { name: 'e2e (cypress)', value: 'e2e' },
      ],
      when: (answers) => {
        return answers.isTest
      },
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
      suffix: ' Yes',
      message: '请确认是否创建?',
    },
  ],
  actions: (data) => {
    const { frame, syntaxType, name, isTest, testType, isCreate } = data // form-item

    if (!isCreate)
      return

    const prefixName = `${PREFIX}${name}` // u-form-item
    const camelName = camelize(name) // formItem
    const pascalName = getPascal(name) // FormItem
    const pascalPrefixName = getPascal(prefixName) // UFormItem
    const fileSuffix = (syntaxType && syntaxType === 'vue') ? '.vue' : '.tsx'
    const suffix = (fileSuffix === '.vue') ? fileSuffix : ''

    const mapFrame = {
      vue: vueComponents,
      react: reactComponents,
    }

    const actions = [
      // 组件
      {
        type: 'add',
        path: `${mapFrame[frame]}/${name}/src/${name}${fileSuffix}`, // 创建路径
        templateFile: `${hbsComponent}/${frame}${fileSuffix}.hbs`, // 模板，将根据此模板内容生成新文件
        data: {
          name,
          camelName,
          prefixName,
          pascalPrefixName,
        },
      },
      // 样式
      {
        type: 'add',
        path: `${mapFrame[frame]}/${name}/src/${name}.less`,
        templateFile: `${hbsComponent}/less.hbs`,
        data: {
          name,
          prefixName,
        },
      },
      // 组件 prop
      {
        type: 'add',
        path: `${mapFrame[frame]}/${name}/src/props.ts`,
        templateFile: `${hbsComponent}/props.hbs`,
        data: {
          name,
          suffix,
          camelName,
          pascalName,
        },
      },
      // 导出
      {
        type: 'add',
        path: `${mapFrame[frame]}/${name}/index.ts`,
        templateFile: `${hbsComponent}/exports.hbs`,
        data: {
          name,
          suffix,
          pascalName,
          pascalPrefixName,
        },
      },
    ]

    if (isTest) {
      const mapTestSuffix = {
        unit: 'test',
        e2e: 'cy',
      }

      let tests = Array.isArray(testType) ? testType : [testType]
      tests = tests.map((type) => {
        return {
          type: 'add',
          path: `${mapFrame[frame]}/${name}/src/${name}.${mapTestSuffix[type]}.ts`,
          templateFile: `${hbsComponent}/test.${mapTestSuffix[type]}.hbs`,
          data: {
            name,
            suffix,
            pascalName,
            pascalPrefixName,
          },
        }
      })
      actions.push(...tests)
    }

    return actions
  },
}

export const setComponent = plop => plop.setGenerator('component', options)
