import fs from 'fs/promises'
import path from 'path'
import glob from 'fast-glob'
import type { SourceFile } from 'ts-morph'
import { ModuleKind, Project, ScriptTarget } from 'ts-morph'
import { parallel, series } from 'gulp'
// sfc 解析
import * as vueCompiler from 'vue/compiler-sfc'
// 优雅的控制台输出
import consola from 'consola'
// 终端 字符样式库
import chalk from 'chalk'
import { withTaskName } from '../utils/gulp'
import { run } from '../utils/process'
import { buildOutput, pkgRoot, projectRoot, tsConfigRoot, typeOutput, uiRoot } from '../config/paths'
import { bundleConfig } from '../config/bundle'
import type { Module } from '../config/bundle'
import { PKG_NAME, PKG_PREFIX } from '../config/constants'

export const genEntryTypes = async () => {
  // 正则匹配所有的 js vue ts
  const globAnyFile = '**/*.{js?(x),ts?(x),vue}'
  const files = await glob([globAnyFile, `!${PKG_NAME}/**/*`], {
    cwd: pkgRoot,
    absolute: true,
    onlyFiles: true,
  })

  consola.log('获取类型文件', files)

  // 新项目信息
  const project = new Project({
    compilerOptions: {
      declaration: true,
      emitDeclarationOnly: true,
      baseUrl: projectRoot, // 编译文件地址
      outDir: typeOutput, // 输出文件地址
      module: ModuleKind.ESNext,
      allowJs: true,
      noEmitOnError: false,
      target: ScriptTarget.ESNext,
      rootDir: uiRoot,
      strict: false,
      paths: {
        '@uno-ux/*': ['packages/*'],
      }, // 路径映射
    },
    skipFileDependencyResolution: true,
    tsConfigFilePath: tsConfigRoot,
    skipAddingFilesFromTsConfig: true,
  })
  consola.log('新项目信息', project)

  // 装载 编译后的源文件
  const sourceFiles: SourceFile[] = []
  await Promise.all([
    ...files.map(async (f) => {
      // 文件 以vue 结尾
      if (f.endsWith('.vue')) {
        // 读取文件内容
        const content = await fs.readFile(f, 'utf-8')
        // sfc 解析
        const sfc = vueCompiler.parse(content)
        // 分割 脚本 和 setup 部分
        const { script, scriptSetup } = sfc.descriptor
        // 如果任意存在
        if (script || scriptSetup) {
          // 获取脚本内容
          let content = script?.content ?? ''
          // 获取 setup 编译结果
          if (scriptSetup) {
            const compiled = vueCompiler.compileScript(sfc.descriptor, {
              id: 'xxx',
            })
            // 编译后产物组合
            content += compiled.content
          }
          // 获取脚本语言类型
          const lang = scriptSetup?.lang || script?.lang || 'js'
          // 创建源文件
          const sourceFile = project.createSourceFile(
            `${path.relative(process.cwd(), f)}.${lang}`,
            content,
          )
          // 放入原文件数组
          sourceFiles.push(sourceFile)
        }
      }
      else {
        // ts js 文件 路径直接放入 f
        const sourceFile = project.addSourceFileAtPath(f)
        sourceFiles.push(sourceFile)
      }
    }),
  ])

  consola.log('转载源文件')

  // 编译诊断
  // const diagnostics = project.getPreEmitDiagnostics()
  // 编译诊断 有 抛出错误
  // if (diagnostics.length > 0) {
  //   // consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics))
  //   const err = new Error('Failed to generate dts.')
  //   // consola.error(err)
  //   throw err
  // }

  // 开始转换 只输出声明文件
  await project.emit({
    emitOnlyDtsFiles: true,
  })

  // 遍历所有的源文件
  const tasks = sourceFiles.map(async (sourceFile) => {
    // 获取文件路径 相对文件位置
    const relativePath = path.relative(pkgRoot, sourceFile.getFilePath())
    consola.log('遍历所有的源文件')
    // 输出追踪
    consola.trace(
      chalk.yellow(
        `Generating definition for file: ${chalk.bold(relativePath)}`,
      ),
    )

    // 转换输出
    const emitOutput = sourceFile.getEmitOutput()
    // 获取 转换输出 文件
    const emitFiles = emitOutput.getOutputFiles()
    // 没有文件 输出 抛出异常
    if (emitFiles.length === 0) {
      // throw new Error(`Emit no file: ${chalk.bold(relativePath)}`)
      consola.log('没有转换输出文件--------：', relativePath)
    }
    else {
      const tasks = emitFiles.map(async (outputFile) => {
        const filepath = outputFile.getFilePath()
        // 创建文件夹
        await fs.mkdir(path.dirname(filepath), { recursive: true })
        // 写入文件位置
        await fs.writeFile(
          filepath,
          outputFile.getText().split(PKG_PREFIX).join('.'),
          'utf8',
        )// 类型输出完成
        consola.success(
          chalk.green(
            `Definition for file: ${chalk.bold(relativePath)} generated`,
          ),
        )
      })
      await Promise.all([tasks])
    }
  })
  await Promise.all(tasks)
}

// 拷贝 生成的类型文件 到生产目录
export const copyEntryTypes = () => {
  const copy = (module: Module) => {
    return parallel(
      withTaskName(`copyEntryTypes:${module}`, async () => {
        await run(
          `cp -r ${typeOutput}/* ${path.resolve(
            buildOutput,
            bundleConfig[module].output.path,
          )}/`,
        )
      }),
    )
  }
  return parallel(copy('esm'), copy('cjs'))
}

export const genTypes = series(
  genEntryTypes,
  // copyEntryTypes(),
)
