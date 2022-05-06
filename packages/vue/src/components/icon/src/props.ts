import type { ExtractPropTypes, PropType } from 'vue'
import type Icon from './icon'

export const iconProps = {
  as: {
    type: String as PropType<keyof HTMLElementTagNameMap>,
    default: 'div',
  },
  modelValue: {
    type: [Object, String],
    default: '',
  },
}

export const iconEmits = {
  error: (evt: Event) => evt instanceof Event,
}

export type IconProps = ExtractPropTypes<typeof iconProps>

export type IconEmits = typeof iconEmits

export type IconInstance = InstanceType<typeof Icon>
