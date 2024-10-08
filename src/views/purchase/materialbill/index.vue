<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="商品名称" clearable size="small" style="width: 240px"
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
            <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" :data="materialbillList" @selection-change="handleSelectionChange" border
          :height="tableHeight" :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="商品名称" align="center" prop="productName" show-overflow-tooltip />
          <el-table-column label="商品类别" align="center" prop="category" :formatter="categoryFormat" />
          <el-table-column label="规格型号" align="center" prop="specification" show-overflow-tooltip />
          <el-table-column label="颜色" align="center" prop="colour" />
          <el-table-column label="计量单位" align="center" prop="unit" />
          <el-table-column label="采购价" align="center" prop="purchasePrice" />
          <el-table-column label="图片" align="center" width="120" prop="imagePath">
            <template slot-scope="scope">
              <el-image style="width: 100px; height: 100px;color:#fff" :src="scope.row.imagePath"
                :preview-src-list="[scope.row.imagePath]"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="米重量" align="center" prop="psm" />
          <el-table-column label="单位重量(G)" align="center" prop="weight" width="100" />
          <el-table-column label="税率（%）" align="center" prop="taxAmount" width="130" />
          <el-table-column label="供应商" align="center" prop="supplier" :formatter="companyFormat" />
          <el-table-column label="内部编号" align="center" prop="internalCode" />
          <el-table-column label="用途" align="center" prop="remark" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="150">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
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
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品类别">
              <el-select v-model="form.category" placeholder="请选择">
                <el-option v-for="dict in categoryOptions" :key="dict.dictValue" :label="dict.dictLabel"
                  :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格型号" prop="specification">
              <el-input v-model="form.specification" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="colour">
              <el-input v-model="form.colour" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="计量单位" prop="specification">
              <el-input v-model="form.unit" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购价" prop="colour">
              <el-input-number v-model="form.purchasePrice" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <v-selectpage :data="companyOptions" ref="xProduct" show-field="dictLabel" key-field="dictValue"
                v-model="form.supplier" :pagination="true" :tb-columns="showFields" title="BOM产品列表" language="cn"
                :result-format="resultFormat" class="form-control">
              </v-selectpage>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图片" prop="imagePath">
              <ImageUpload v-model="form.imagePath"></ImageUpload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="单位重量" prop="weight">
              <el-input-number v-model="form.weight" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="米重量" prop="totalWeight">
              <el-input v-model="form.psm" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用途" prop="remark">
              <el-select v-model="form.remark" placeholder="请选择">
                <el-option v-for="item in productOptions" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税率(%)" prop="taxAmount" label-width="80px">
              <el-input-number v-model="form.taxAmount" :step="2" controls-position="right" :min="1" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="内部编号" prop="internalCode">
              <el-input v-model="form.internalCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品编号" prop="productCode">
              <el-input v-model="form.productCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 物料导入对话框 -->
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
  selectMaterialList,
  getMaterialbill,
  addMaterialbill,
  updateMaterialbill,
  delMaterialbill,
  exportMaterialbill,
  importTemplate,
} from "@/api/purchase/materialbill";
import { selectProducts } from "@/api/purchase/bom";
import { getToken } from "@/utils/auth";

export default {
  name: "Materialbill",
  data() {
    return {
      // 遮罩层
      loading: true,
      dialogVisible: false,
      imagePathScope: undefined,
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
      // 物料清单表格数据
      materialbillList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 商品名称
      productName: undefined,
      // 日期范围
      dateRange: [],
      // 类别状态字典
      categoryOptions: [],
      //供应商公司字典
      companyOptions: [],
      productOptions: [],
      // 表单参数
      form: {
        taxAmount: 98,
      },
      showFields: [{ title: "产品名称", data: "dictLabel" }],
      // 导入参数
      upload: {
        // 是否显示弹出层（导入）
        open: false,
        // 弹出层标题（导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/purchase/materialbill/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: undefined,
      },
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        weight: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        width: [{ required: true, message: "不能为空", trigger: "blur" }],
        taxAmount: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
        contactWay: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.initDicts();
    this.initProducts();
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
        if (!this.isBlank(val.weight)) {
          val.inspectWeight = parseInt(val.weight) * 0.05;
        } else {
          val.inspectWeight = null;
        }
        if (!this.isBlank(val.weight)) {
          val.inspectWidth = parseInt(val.width) * 0.03;
        } else {
          val.inspectWidth = null;
        }
      },
      deep: true,
    },
  },

  methods: {
    handleImage(val) {
      this.dialogVisible = true;
      this.imagePathScope = val.row.imagePath;
    },
    initDicts() {
      this.getDicts("material_bill_category").then((response) => {
        this.categoryOptions = response.data;
      });
      this.getDicts("supplier_company").then((response) => {
        this.companyOptions = response.data;
      });
    },
    initProducts() {
      selectProducts().then((response) => {
        this.productOptions = response.rows;
      });
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
    isBlank(val) {
      let valString = val + "";
      let isBlankType = ["", "null", "undefined"];
      return isBlankType.includes(valString);
    },
    /** 查询物料清单列表 */
    getList() {
      this.loading = true;
      selectMaterialList(
        this.addDateRange(this.queryParams, this.dateRange)
      ).then((response) => {
        this.materialbillList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 字典状态字典翻译
    categoryFormat(row, column) {
      return this.selectDictLabel(this.categoryOptions, row.category);
    },
    companyFormat(row, column) {
      return this.selectDictLabel(this.companyOptions, row.supplier);
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
      this.ids = selection.map((item) => item.materialId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加物料清单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const materialId = row.materialId;
      getMaterialbill(materialId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改物料清单";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.materialId != undefined) {
            updateMaterialbill(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMaterialbill(this.form).then((response) => {
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
      const ids = row.materialId || this.ids;
      this.$confirm('是否确认删除物料ID为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delMaterialbill(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有物料清单数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportMaterialbill(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "物料导入";
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

<style lang="css" scoped>
.el-form-item .el-select {
  width: 100%;
}

.el-input-number {
  width: 100%;
}

.el-input {
  width: 100%;
}

.picker-width {
  width: 100%;
}

html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>