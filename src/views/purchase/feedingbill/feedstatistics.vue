<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-table v-loading="loading" :data="feedBillList" :height="tableHeight" ref="multipleTable" border
          :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }" style="font-size: 13px">
          <el-table-column label="柜号" align="center" prop="orderCode" />
          <el-table-column label="生产地" align="center" prop="productPlace" />
          <el-table-column label="产品名称" align="center" prop="productName" />
          <el-table-column label="物料名称" align="center" width="150" prop="materialName" />
          <el-table-column label="物料编码" align="center" prop="materialCode" />
          <el-table-column label="单位" align="center" prop="unit" />
          <el-table-column label="计划数量" align="center" prop="planNum" />
          <el-table-column label="数量总和" align="center" prop="totalPickNum" />
          <el-table-column label="差额" align="center" prop="balance" />
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { feedingStatistics } from "@/api/purchase/pickingbill";
export default {
  name: "Feedstatistics",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表格数据
      feedBillList: [],
      tableHeight: 0,
      bomList: [],
      // 查询参数
      queryParams: {
        orderCode: undefined,
      }
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 150;
      const $table = this.$refs;
    })
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      this.queryParams.orderCode = this.$route.query.orderCode;
      feedingStatistics(this.queryParams.orderCode).then((response) => {
        this.feedBillList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
  },
};
</script>
<style scoped lang="scss">
.image {
  position: relative;

  .mask {
    opacity: 0;
    position: absolute;
    top: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: all 0.3s;
  }

  &:hover .mask {
    opacity: 1;
  }
}
</style>