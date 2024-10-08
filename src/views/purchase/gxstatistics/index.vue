<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="报工日期">
            <el-date-picker v-model="dateRange" size="small" style="width: 210px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="柜号" prop="workOrderCode">
            <el-input v-model="queryParams.workOrderCode" placeholder="柜号" clearable size="small"
              style="width: 140px" />
          </el-form-item>
          <el-form-item label="产品名" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="产品名" clearable size="small" style="width: 140px" />
          </el-form-item>
          <el-form-item label="生产地" prop="productPlace">
            <el-input v-model="queryParams.productPlace" placeholder="生产地" clearable size="small"
              style="width: 140px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :disabled="!multiple"
              @click="handleExport">按日期统计导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :disabled="multiple"
              @click="handlePickingExport">按柜号领料统计导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :disabled="multiple"
              @click="handleExport">按柜号统计导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-thumb" size="mini" @click="handleSwitchover">动态切换</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" :data="GXStatisticsList" ref="multipleTable" border
          :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }" style="font-size: 13px"
          :height="tableHeight">

          <el-table-column label="柜号" align="center" prop="workOrderCode" fixed width="90" />
          <el-table-column label="产品名称" align="center" prop="productName" width="120" show-overflow-tooltip />
          <el-table-column label="生产地点" align="center" prop="productPlace" />
          <el-table-column label="报工日期" align="center" prop="reportDate" v-if="columns[0].visible" width="110" />
          <el-table-column label="车间领料数" align="center" prop="totalPickNum" width="100" v-else />
          <el-table-column label="GX01" align="center" prop="gx01" />
          <el-table-column label="GX02" align="center" prop="gx02" />

          <el-table-column label="GX03" align="center" prop="gx03" />
          <el-table-column label="GX04" align="center" prop="gx04" />
          <el-table-column label="GX05" align="center" prop="gx05" />
          <el-table-column label="GX06" align="center" prop="gx06" />
          <el-table-column label="GX07" align="center" prop="gx07" />
          <el-table-column label="GX08" align="center" prop="gx08" />
          <el-table-column label="G10" align="center" prop="g10" />
          <el-table-column label="GX09" align="center" prop="gx09" />
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" :page-sizes="[10, 50, 100, 150, 200]" @pagination="getList" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  selectGXStatistics,
  exportGXStatistics,
  exportGXPickingStatistics,
} from "@/api/purchase/producereport";

export default {
  name: "GXStatistics",
  data() {
    return {
      // 遮罩层
      loading: true,
      tableHeight: 0,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      GXStatisticsList: [],
      // 日期范围
      dateRange: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dynSwitch: true,
        workOrderCode: undefined,
        productName: undefined,
        productPlace: undefined,
      },
      // 列信息
      columns: [
        { key: 0, label: `报工日期`, visible: true },
        { key: 1, label: `车间领料数`, visible: false },
      ],
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 280;
      const $table = this.$refs;
    })
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectGXStatistics(
        this.addDateRange(this.queryParams, this.dateRange)
      ).then((response) => {
        this.GXStatisticsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSwitchover() {
      this.queryParams.dynSwitch = !this.queryParams.dynSwitch;
      this.multiple = !this.multiple;
      this.getList();
      this.columns[0].visible = !this.columns[0].visible;
      this.columns[1].visible = !this.columns[1].visible;
      //解決固定列后错乱，发生错位的原因，是由于table在数据请求后，渲染异常的问题；因此，解决办法就是让table重新布局。
      this.$nextTick(() => {
        this.$refs.multipleTable.doLayout();
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportGXStatistics(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 导出车间领料数量 */
    handlePickingExport() {
      exportGXPickingStatistics(this.queryParams).then((response) => {
        this.exportExcel("工序领料数量统计表", response);
      });
    },
  },
};
</script>
<style scoped></style>
