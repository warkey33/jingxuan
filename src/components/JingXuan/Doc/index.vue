<template>
  <div>
    <svg-icon icon-class="question" @click="goto"/>
  </div>
</template>

<script>
export default {
  name: 'jingxuanDoc',
  data() {
    return {
      url: 'http://doc.jingxuan.vip/jingxuan-vue'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>