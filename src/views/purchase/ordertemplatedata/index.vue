<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="订单号" prop="orderNum">
            <el-input v-model="queryParams.orderNum" placeholder="订单号" clearable size="small" style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="交货时间"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
              @click="handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :disabled="multiple"
              @click="handleTemplateExport">生成工单模板</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini"
              @click="handleImport">导入订单交货信息</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" border ref="multipleTable" :data="orderTemplateDataList" :height="tableHeight"
          :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }" style="font-size: 13px"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="订单号" align="center" prop="orderNum" fixed />
          <el-table-column label="序号" align="center" prop="serialNum" />
          <el-table-column label="花片号始" align="center" prop="cuttingPieceNumStart" />
          <!-- <el-table-column label="花片号尾" align="center" prop="cuttingPieceNumEnd" /> -->
          <el-table-column label="开始日期" align="center" prop="planStartDate" width="100" />
          <el-table-column label="交货时间" align="center" prop="planEndDate" width="100" />
          <el-table-column label="产品编号" align="center" prop="productCode" />
          <el-table-column label="产品名称" align="center" prop="productName" width="120" />
          <el-table-column label="颜色" align="center" prop="colour" />
          <el-table-column label="组总数" align="center" prop="cuttingPieceNum" />
          <el-table-column label="数量/GROUP" align="center" prop="amount" width="120" />
          <el-table-column label="订单总数" align="center" prop="totalAmount" width="120" />
          <el-table-column label="尾卡数" align="center" prop="tailCardCount" />
          <el-table-column label="其它卡数" align="center" prop="otherCardCount" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="150">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-if="scope.row.userId !== 1" size="mini" type="text" icon="el-icon-delete"
                @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNum">
              <el-input v-model="form.orderNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="序号" prop="serialNum">
              <el-input-number v-model="form.serialNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品编号" prop="productCode">
              <v-selectpage :data="bomList" show-field="productCode" ref="xProduct" key-field="productCode"
                v-model.trim="form.productCode" :pagination="true" :tb-columns="showFields" title="产品列表" language="cn"
                :result-format="resultFormat" @values="handelSingleValues" class="form-control">
              </v-selectpage>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="花片号始" prop="cuttingPieceNumStart">
              <el-input v-model="form.cuttingPieceNumStart" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="花片号尾" prop="cuttingPieceNumEnd">
              <el-input v-model="form.cuttingPieceNumEnd" placeholder="请输入" />
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item label="颜色" prop="colour">
              <el-input v-model="form.colour" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="planStartDate">
              <vue-datepicker-local v-model="form.planStartDate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交货时间" prop="planEndDate">
              <vue-datepicker-local v-model="form.planEndDate" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="组总数" prop="cuttingPieceNum">
              <el-input-number v-model="form.cuttingPieceNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量/GROUP" prop="amount" label-width="110px">
              <el-input v-model="form.amount" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="尾卡数" prop="tailCardCount">
              <el-input-number v-model="form.tailCardCount" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其它卡数" prop="otherCardCount">
              <el-input-number v-model="form.otherCardCount" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="订单总数" prop="totalAmount">
              <el-input v-model="form.totalAmount" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
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
  selectOrderTemplateDataList,
  getOrderTemplateData,
  addOrderTemplateData,
  updateOrderTemplateData,
  delOrderTemplateData,
  exportWorkOrderTemplateData,
  exportTemplate,
} from "@/api/purchase/ordertemplatedata";
import { selectProductList } from "@/api/purchase/productmanager";
import { getToken } from "@/utils/auth";
import VueDatepickerLocal from "vue-datepicker-local";
import { MessageBox } from "element-ui";

export default {
  name: "OrderTemplateData",
  components: {
    VueDatepickerLocal,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      orderNums: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      orderTemplateDataList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      tableHeight: 0,
      // 表单参数
      form: {
        tailCardCount: undefined,
      },
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
        url: process.env.VUE_APP_BASE_API + "/purchase/ordertemplatedata/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNum: undefined,
      },
      // 表单校验
      rules: {
        orderNum: [{ required: true, message: "不能为空", trigger: "blur" }],
        serialNum: [{ required: true, message: "不能为空", trigger: "blur" }],
        totalAmount: [{ required: true, message: "不能为空", trigger: "blur" }],
        cuttingPieceNumStart: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        cuttingPieceNumEnd: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        planStartDate: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        planEndDate: [{ required: true, message: "不能为空", trigger: "blur" }],
        cuttingPieceNum: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        tailCardCount: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        otherCardCount: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        productCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
      showFields: [
        { title: "产品编号", data: "productCode" },
        { title: "产品名称", data: "productName" },
      ],
      bomList: [],
    };
  },
  created() {
    this.initProductList();
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 280;
      const $table = this.$refs;
    })
  },
  watch: {
    form: {
      handler(val, oldVal) {
        if (!isNaN(val.cuttingPieceNum) && !isNaN(val.totalAmount)) {
          val.amount = Math.ceil(val.totalAmount / val.cuttingPieceNum);
        }
      },
      deep: true,
    },
  },
  methods: {
    isBlank(val) {
      let valString = val + "";
      let isBlankType = ["", "null", "undefined"];
      return isBlankType.includes(valString);
    },
    handelSingleValues(data) {
      // 数据监听
      if (data !== undefined && data.length > 0) {
        this.form.productName = data[0].productName;
      }
    },
    initProductList() {
      selectProductList({ type: "0", pageNum: 1, pageSize: 1000 }).then(
        (response) => {
          this.bomList = response.rows;
        }
      );
    },
    resultFormat(res) {
      if (res.status != 200) {
        console.info("商品下拉选择数据加载为空");
        return;
      }
      let obj = {
        totalRow: res.data.total,
        list: res.data.rows,
      };
      return obj;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectOrderTemplateDataList(
        this.addDateRange(this.queryParams, this.dateRange)
      ).then((response) => {
        this.orderTemplateDataList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.$refs.xProduct.remove();
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {};
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.templateId);
      this.orderNums = [...new Set(selection.map((item) => item.orderNum))];
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */

    handleUpdate(row) {
      const templateId = row.templateId;
      getOrderTemplateData(templateId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.templateId != undefined) {
            updateOrderTemplateData(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addOrderTemplateData(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.templateId || this.ids;
      this.$confirm('是否确认删除ID为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delOrderTemplateData(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    handleTemplateExport(row) {
      if (this.orderNums.length !== 1) {
        MessageBox.alert("请选择相同订单号生成模板！", "警告");
        return;
      }
      const ids = row.templateId || this.ids;
      exportWorkOrderTemplateData(ids).then((response) => {
        this.download(response.msg);
      });
    },
    /** 下载模板操作 */
    importTemplate() {
      exportTemplate().then((response) => {
        this.download(response.msg);
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "物料导入";
      this.upload.open = true;
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
<style lang="css" scoped>
.el-table {
  width: 100%;

  .el-table__header-wrapper table,
  .el-table__body,
  .el-table__footer,
  .el-table__header {
    table-layout: auto;
  }
}
</style>
