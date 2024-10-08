<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="裁剪区域" name="first">
        <aa ref="formComp1" v-if="activeName === 'first'"></aa>
      </el-tab-pane>
      <el-tab-pane label="绣花区域" name="second">
        <bb ref="formComp2" v-if="activeName === 'second'"></bb>
      </el-tab-pane>
      <el-tab-pane label="车间领料区域" name="third">
        <cc ref="formComp3" v-if="activeName === 'third'"></cc>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import aa from "./cuttingarea";
import bb from "./embroideryarea";
import cc from "./pickingarea";
export default {
  name: "Tabs",
  components: {
    aa,
    bb,
    cc,
  },
  data() {
    return {
      activeName: "first",
      queryParams: {
        productName: undefined,
      },
    };
  },
  methods: {
    handleClick(tab, event) {
      this.activeName = tab.name;
    },
  },
};
</script>