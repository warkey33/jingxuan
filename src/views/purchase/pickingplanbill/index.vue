<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="收回时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="绣花厂" prop="embrFactory">
            <el-select v-model="queryParams.embrFactory" type="text" clearable>
              <el-option v-for="item in factoryList" :key="item.productCode" :value="item.productName"
                :label="`${item.productName}`"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="柜号" prop="cabinetNum">
            <el-input v-model="queryParams.cabinetNum" placeholder="柜号" clearable size="small" />
          </el-form-item>
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="产品名称" clearable size="small" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport">裁片领料导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">裁片导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" size="mini" plain icon="el-icon-download"
              @click="handleCuttingExport">裁片入库单</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain size="mini" icon="el-icon-download"
              @click="handleEmbroiderExport">绣片入库单</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain size="mini" icon="el-icon-download"
              @click="handleEmbroiderBillExport">裁剪绣花账单</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="bomList" :height="tableHeight" @selection-change="handleSelectionChange"
          border ref="multipleTable" :row-style="{ height: '40px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="柜号" align="center" prop="cabinetNum">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.cabinetNum
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="产品编号" align="center" prop="productCode">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.productCode
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
          <el-table-column label="组数" align="center" prop="groupNum">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.groupNum
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="计划数量" align="center" prop="planNum" />
          <el-table-column label="裁片数" align="center" prop="cuttingNum" />
          <el-table-column label="米数" align="center" prop="consumeMetersNum" />
          <el-table-column label="绣花数量" align="center" prop="embroiderNum" />
          <el-table-column label="领料数量" align="center" prop="pickingNum" />
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" :action="upload.url"
        :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess"
        :auto-upload="false" drag>
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
  selectPickingplanbillList,
  exportPickingplanbill,
  exportCutEmbrbill,
  importTemplate,
} from "@/api/purchase/pickingplanbill";
import { getToken } from "@/utils/auth";
import { cuttingentrybill } from "@/api/purchase/sewpickbill";
import { exportentrybill } from "@/api/purchase/pickplanbill";
import { selectProductList } from "@/api/purchase/productmanager";

export default {
  name: "Pickingplanbill",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      newArr: [{ cabinetNum: "", productName: "" }],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      tableHeight: 0,
      // 表格数据
      bomList: [],
      factoryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
      // 表单参数
      form: {},
      // 日期范围
      dateRange: [],
      // 导入参数
      upload: {
        // 是否显示弹出层（导入）
        open: false,
        // 弹出层标题（导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url:
          process.env.VUE_APP_BASE_API + "/purchase/pickingplanbill/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
    };
  },
  created() {
    this.initFactoryList();
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 330;
      const $table = this.$refs;
    })
  },
  methods: {
    handleDetail(row) {
      const cabinetNum = row.cabinetNum;
      const groupNum = row.groupNum;
      const productName = row.productName;
      const planNum = row.planNum;
      this.$router.push({
        //核心语句
        path: "pickingplanbilldetail", //跳转的路由
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          cabinetNum: cabinetNum,
          groupNum: groupNum,
          productName: productName,
          planNum: planNum,
        },
      });
    },
    initFactoryList() {
      selectProductList({ type: "1", pageNum: 1, pageSize: 100 }).then(
        (response) => {
          this.factoryList = response.rows;
        }
      );
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectPickingplanbillList(this.queryParams).then((response) => {
        this.bomList = response.rows;
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
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.newArr = selection.map((item) => item);
      this.multipleSelection = selection;
      this.multiple = !selection.length;
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
    /** 导出按钮操作 */
    handleExport() {
      exportPickingplanbill(this.newArr).then((response) => {
        this.download(response.msg);
      });
    },
    /** 导出绣花入库单 */
    handleEmbroiderExport() {
      this.queryParams.productName = this.$route.query.productName;
      exportentrybill(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.download(response.msg);
        }
      );
    },
    handleEmbroiderBillExport() {
      exportCutEmbrbill(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.download(response.msg);
        }
      );
    },
    handleCuttingExport() {
      cuttingentrybill(
        this.addDateRange(this.queryParams, this.dateRange)
      ).then((response) => {
        this.download(response.msg);
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