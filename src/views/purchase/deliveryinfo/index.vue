<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="柜号" prop="cabinetNum">
            <el-input v-model="queryParams.cabinetNum" placeholder="柜号" clearable size="small" style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="物料号" prop="materialNum">
            <el-input v-model="queryParams.materialNum" placeholder="物料号" clearable size="small" style="width: 240px"
              @keyup.enter.native="handleQuery" />
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
              @click="exportWordDoc">生成纸箱模板</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
        </el-row>
        <el-table v-loading="loading" :data="orderTemplateDataList" border :height="tableHeight"
          :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }" style="font-size: 13px"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="柜号" align="center" prop="cabinetNum" />
          <el-table-column label="物料号" align="center" prop="materialNum" width="100" />
          <el-table-column label="规格" align="center" prop="bagSize" />
          <el-table-column label="颜色" align="center" prop="colour" width="100" />
          <el-table-column label="数量" align="center" prop="quantity" />
          <el-table-column label="目的地" align="center" prop="deliveryPlace" :formatter="statusFormat" />
          <el-table-column label="目的地值" align="center" prop="deliveryPlaceValue" width="100" />
          <el-table-column label="CANADA" align="center" prop="plantCanada" width="130" />
          <el-table-column label="交货日期" align="center" prop="deliveryDate" width="100" />
          <el-table-column label="船运号" align="center" prop="shipmentNum" width="100" />
          <el-table-column label="备注" align="center" prop="remark" width="100" />
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
            <el-form-item label="柜号" prop="cabinetNum">
              <el-input v-model="form.cabinetNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料号" prop="materialNum">
              <el-input v-model="form.materialNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="颜色" prop="shipmentNum">
              <el-input v-model="form.colour" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="交货日期" prop="deliveryDate">
              <vue-datepicker-local v-model="form.deliveryDate" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="船运号" prop="shipmentNum">
              <el-input v-model="form.shipmentNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="目的地" prop="deliveryPlace">
              <el-select v-model="form.deliveryPlace" placeholder="请选择">
                <el-option v-for="dict in deliveryOptions" :key="dict.dictValue" :label="dict.dictLabel"
                  :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的地值" prop="deliveryPlaceValue">
              <el-input v-model="form.deliveryPlaceValue" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格" prop="bagSize">
              <el-input v-model="form.bagSize" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="CANADA" prop="plantCanada">
              <el-input v-model="form.plantCanada" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" v-loading="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false"
        :action="upload.url" drag>
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
  addDeliveryInfo,
  delDeliveryInfo,
  exportDeliveryInfoWordDoc,
  getDeliveryInfo,
  selectDeliveryInfoList,
  updateDeliveryInfo
} from "@/api/purchase/deliveryinfo";
import { getToken } from "@/utils/auth";
import VueDatepickerLocal from "vue-datepicker-local";

export default {
  name: "DeliveryInfo",
  components: {
    VueDatepickerLocal,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      materialNums: [],
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
      orderTemplateDataList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 类别状态字典
      deliveryOptions: [],
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
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        cabinetNum: undefined,
        materialNum: undefined,
      },
      // 表单校验
      rules: {
        cabinetNum: [{ required: true, message: "不能为空", trigger: "blur" }],
        materialNum: [{ required: true, message: "不能为空", trigger: "blur" }],
        quantity: [{ required: true, message: "不能为空", trigger: "blur" }],
        deliveryDate: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        deliveryPlace: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        deliveryPlaceValue: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("delivery_place").then((response) => {
      this.deliveryOptions = response.data;
    });
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
        if (!this.isBlank(val.deliveryPlace)) {
          val.plantCanada = val.deliveryPlace;
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
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.deliveryOptions, row.deliveryPlace);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectDeliveryInfoList(
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
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {};
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
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.deliveryId);
      if (selection.length > 1) {
        this.$refs.multipleTable.clearSelection();
        this.$refs.multipleTable.toggleRowSelection(selection.pop());
      }
      this.multipleSelection = selection;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const deliveryId = row.deliveryId;
      getDeliveryInfo(deliveryId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.deliveryId != undefined) {
            updateDeliveryInfo(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDeliveryInfo(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.form.deliveryId = undefined;
              this.form.materialNum = undefined;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.deliveryId || this.ids;
      this.$confirm('是否确认删除ID为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delDeliveryInfo(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    exportWordDoc(row) {
      const ids = row.deliveryId || this.ids;
      this.$confirm("是否确认导出模板数据?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportDeliveryInfoWordDoc(ids);
        })
        .then((response) => {
          this.download(response.msg);
        });
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
