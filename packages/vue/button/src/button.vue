<script lang='ts'>
import { defineComponent } from 'vue'
import { buttonProps } from './button'

export default defineComponent({
  name: 'UButton',
  props: buttonProps,

  setup() {
    const handlerClick = () => {
      windows.alert('WQ!!!!!!')
    }

    return {
      handlerClick,
    }
  },
})
</script>

<template>
  <div :type="type" @click="handlerClick">
    Primary
  </div>
</template>

