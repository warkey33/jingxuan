<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="报工时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="柜号" prop="workOrderCode">
            <el-select v-model="queryParams.workOrderCodes" multiple placeholder="请选择" size="small">
              <el-option v-for="workOrderCode in cabinetList" :key="workOrderCode" :value="workOrderCode">{{
                workOrderCode }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工序" prop="processCode">
            <el-select v-model="queryParams.processCodes" multiple placeholder="请选择" size="small">
              <el-option v-for="processCode in processList" :key="processCode" :value="processCode">{{ processCode
                }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="产品名称" clearable size="small" />
          </el-form-item>
          <el-form-item label="生产地" prop="productPlace">
            <el-select v-model="queryParams.productPlaces" multiple placeholder="请选择" size="small">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport">导入报表</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :disabled="multiple"
              @click="exportWorkeOrderSummary">导出工单汇总表</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini"
              @click="handleExport">导出工人工单清单</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
              @click="handleDelete">删除</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" :data="produceReportList" ref="multipleTable" :height="tableHeight"
          @selection-change="handleSelectionChange" border :row-style="{ height: '39px' }"
          :cell-style="{ padding: '0px' }" style="font-size: 13px">
          <el-table-column type="selection" align="center" />
          <el-table-column label="柜号" align="center" prop="workOrderCode">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.workOrderCode
                }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="生产地" align="center" prop="productPlace">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.productPlace
                }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="产品名称" align="center" prop="productName">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.productName
                }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="总条数" align="center" prop="totalNum" />
          <el-table-column label="报工时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" align="center" prop="createBy" />
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button v-if="scope.row.userId !== 1" size="mini" type="text" icon="el-icon-delete"
                @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag
        v-loading="upload.isUploading">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-link type="info" style="font-size: 12px" @click="importTemplate">下载模板</el-link>
        </div>
        <div class="el-upload__tip" style="color: red" slot="tip">
          提示：仅允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  selectProduceReportList,
  selectCabinetList,
  selectProcessList,
  delProduceReport,
  exportProduceReport,
  exportWorkOrder,
  importTemplate,
} from "@/api/purchase/producereport";
import { getToken } from "@/utils/auth";
import VueDatepickerLocal from "vue-datepicker-local";

export default {
  name: "ProduceReport",
  components: {
    VueDatepickerLocal,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      workOrderCodes: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      tableHeight: 0,
      // 表格数据
      produceReportList: [],
      cabinetList: [],
      processList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 导入参数
      upload: {
        // 是否显示弹出层（导入）
        open: false,
        // 弹出层标题（导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/purchase/report/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        workOrderCodes: undefined,
        productPlaces: undefined,
        processCodes: undefined,
        productName: undefined,
      },
      options: [
        {
          value: "S",
          label: "S",
        },
        {
          value: "H",
          label: "H",
        },
        {
          value: "I",
          label: "I",
        },
        {
          value: "K",
          label: "K",
        },
      ],
    };
  },
  created() {
    // this.rangeDate();
    this.getList();
    this.getCabinetList();
    this.getProcessList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 350;
      const $table = this.$refs;
    })
  },
  methods: {
    rangeDate() {
      //查询当前月份月初到月末
      let myDate = new Date();
      let month = myDate.getMonth();
      month = month < 10 ? "0" + month : month; //格式化月份，补0
      let statDateStart = myDate.getFullYear().toString() + "-" + month + "-01"; //月初
      let dayEnd = new Date(myDate.getFullYear(), month, 0).getDate(); //获取当月一共有多少天
      let statDateEnd =
        myDate.getFullYear().toString() + "-" + month + "-" + dayEnd; //月末
      this.dateRange.push(statDateStart, statDateEnd);
    },
    handleDetail(row) {
      const productName = row.productName;
      const workOrderCode = row.workOrderCode;
      const productPlace = row.productPlace;
      const dates = this.dateRange;
      this.$router.push({
        //核心语句
        path: "reportdetail", //跳转的路由
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          productName: productName,
          workOrderCode: workOrderCode,
          productPlace: productPlace,
          startDate: dates[0],
          endDate: dates[1]
        },
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectProduceReportList(
        this.addDateRange(this.queryParams, this.dateRange)
      ).then((response) => {
        this.produceReportList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getCabinetList() {
      selectCabinetList().then((response) => {
        this.cabinetList = response.rows;
      });
    },
    getProcessList() {
      selectProcessList().then((response) => {
        this.processList = response.rows;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        productName: undefined,
        workOrderCode: undefined,
        goodsNum: undefined,
        goboCode: undefined,
        processCode: undefined,
        productStaff: undefined,
        remark: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.workOrderCodes = Array.from(new Set(selection.map((item) => item.workOrderCode)));
      this.single = selection.length != 1;
      this.multipleSelection = selection;
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const workOrderCodes = row.workOrderCode || this.workOrderCodes;
      this.$confirm('是否确认删除为"' + workOrderCodes + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delProduceReport(workOrderCodes);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      exportProduceReport(
        this.addDateRange(this.queryParams, this.dateRange)
      ).then((response) => {
        this.exportExcel("工人工单清单表", response);
      });
    },
    exportWorkeOrderSummary(row) {
      const workOrderCodes = row.workOrderCode || this.workOrderCodes;
      this.queryParams.workOrderCodes = workOrderCodes;
      exportWorkOrder(this.addDateRange(this.queryParams, this.dateRange))
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg);
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
  },
};
</script>
