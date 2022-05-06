// https://lexmin0412.github.io/plop-cn-docs/
import type { NodePlopAPI } from 'plop'
import { setComponent, setHooks } from './tasks'

export default (plop: NodePlopAPI) => {
  setComponent(plop)
  setHooks(plop)
}
