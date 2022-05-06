// 状态：
// v-model：

import { defineComponent } from 'vue'
import { iconEmits, iconProps } from './props'

export default defineComponent({
  props: iconProps,
  setup(props) {
    // 动态创建标签
    const Tag = props.as || 'div'

    const emit = defineEmits(iconEmits)

    return {
      Tag,
      emit,
    }
  },

  render() {
    const children = this.$slots.default?.() || []
    const Tag = this.Tag

    return (
      <Tag onMouseup={this.onMouseup} onMousedown={this.onMousedown}>
        {children}
      </Tag>
    )
  },
})
