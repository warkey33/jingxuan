<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="品名" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="品名" clearable size="small" style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
              v-hasPermi="['purchase:inspectionbill:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['purchase:inspectionbill:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport"
              v-hasPermi="['purchase:inspectionbill:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
              v-hasPermi="['purchase:inspectionbill:export']">导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :height="tableHeight" border :data="inspectionbillList"
          @selection-change="handleSelectionChange" :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="检验单编号" align="center" prop="inspectionId" />
          <el-table-column label="品名" align="center" prop="productName" />
          <el-table-column label="单重（g）" align="center" prop="pieceWeight" />
          <el-table-column label="总重（g）" align="center" prop="totalWeight" />
          <el-table-column label="对比图片" width="120" align="center" prop="picturePath">
            <template slot-scope="scope">
              <el-image style="width: 100px; height: 100px;color:#fff" :src="scope.row.picturePath"
                :preview-src-list="[scope.row.picturePath]"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="结论" align="center" prop="conclusion" />
          <el-table-column label="备注" align="center" prop="remark" width="180" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['purchase:inspectionbill:edit']">修改</el-button>
              <el-button v-if="scope.row.userId !== 1" size="mini" type="text" icon="el-icon-delete"
                @click="handleDelete(scope.row)" v-hasPermi="['purchase:inspectionbill:remove']">删除</el-button>
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
            <el-form-item label="品名" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入品名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单重（g）" prop="pieceWeight">
              <el-input v-model="form.pieceWeight" placeholder="请输入单重（g）" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总重（g）" prop="totalWeight">
              <el-input v-model="form.totalWeight" placeholder="请输入总重（g）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图片对比" prop="picturePath">
              <ImageUpload v-model="form.picturePath"></ImageUpload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="结论">
              <el-input v-model="form.conclusion" type="textarea" placeholder="请输入内容" />
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

    <!-- 检验记录单导入对话框 -->
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
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的检验记录单数据
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
  list,
  getInspectionbill,
  addInspectionbill,
  updateInspectionbill,
  delInspectionbill,
  exportInspectionbill,
} from "@/api/purchase/inspectionbill";
import { getToken } from "@/utils/auth";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import ElImageViewer from "element-ui/packages/image/src/image-viewer";

export default {
  name: "Inspectionbill",
  components: {
    ElImageViewer,
  },
  data() {
    return {
      dialogVisible: false,
      // 遮罩层
      loading: true,
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
      tableHeight: 0,
      // 检验清单表格数据
      inspectionbillList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 显示查看器
      showViewer: false,
      imagePathScope: "",
      // 表单参数
      form: {},
      // 检验记录单导入参数
      upload: {
        // 是否显示弹出层（检验记录单导入）
        open: false,
        // 弹出层标题（检验记录单导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的检验记录单数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API,
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
          { required: true, message: "品名不能为空", trigger: "blur" },
        ],
        nickName: [
          {
            required: true,
            message: "检验记录单昵称不能为空",
            trigger: "blur",
          },
        ],
        phonenumber: [
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
    handleImage(val) {
      this.dialogVisible = true;
      this.imagePathScope = val.row.picturePath;
    },
    /** 查询检验清单列表 */
    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.inspectionbillList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        inspectionId: undefined,
        productName: undefined,
        pieceWeight: undefined,
        totalWeight: undefined,
        picturePath: undefined,
        conclusion: undefined,
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
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.inspectionId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加检验清单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const inspectionId = row.inspectionId;
      getInspectionbill(inspectionId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改检验清单";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.inspectionId != undefined) {
            updateInspectionbill(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInspectionbill(this.form).then((response) => {
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
      const ids = row.inspectionId || this.ids;
      this.$confirm(
        '是否确认删除检验记录单编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delInspectionbill(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有检验清单数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportInspectionbill(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "检验记录单导入";
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