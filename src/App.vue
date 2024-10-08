<template>
  <div id="app">
    <!-- 解决子页面路由跳转数据不刷新问题 -->
    <router-view :key="$route.path" v-if="!$route.meta.keepAlive"/>
    <!-- 缓存所有的页面，解决切换丢失查询条件 -->
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
  </div>
</template>

<script >
export default {
  name: "App",
};
</script>
