<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="产品名称" clearable size="small"
              style="width: 240px" />
          </el-form-item>
          <el-form-item label="裁片编号" prop="cuttingCode">
            <el-input v-model="queryParams.cuttingCode" placeholder="裁片编号" clearable size="small"
              style="width: 240px" />
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
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="feedBillList" ref="multipleTable" @selection-change="handleSelectionChange"
          :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }" style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="检验日期" align="center" prop="inspectDate" />
          <el-table-column label="裁片编号" align="center" prop="cuttingCode" />
          <el-table-column label="产品名称" align="center" prop="productName" />
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body :close-on-click-modal="false"
      :showClose="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="检验日期" prop="inspectDate">
              <el-date-picker v-model="form.inspectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                class="picker-width" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="裁片编号" prop="cuttingCode">
              <el-input v-model="form.cuttingCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品名称" prop="productName">
              <v-selectpage :data="bomList" show-field="productName" key-field="productName" v-model="form.productName"
                :pagination="true" :tb-columns="showFields" title="BOM产品列表" language="cn" :result-format="resultFormat"
                @values="handleSingleValues" class="form-control">
              </v-selectpage>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div>
        <vxe-toolbar ref="xToolbar" :loading="loading">
          <template #buttons>
            <vxe-button size="mini" status="primary" @click="insertEvent">临时新增</vxe-button>
            <vxe-button size="mini" status="warning" @click="$refs.xTable.removeCheckboxRow()">临时删除</vxe-button>
          </template>
        </vxe-toolbar>
        <vxe-table border resizable show-footer :height="tableHeight" keep-source class="mytable-scrollbar" size="mini"
          ref="xTable" :loading="loading" :data="excelData" :edit-rules="validRules" :edit-config="{
            mode: 'row',
            autoClear: true,
          }">
          <vxe-column type="checkbox" width="50"></vxe-column>
          <vxe-column field="projectType" title="项目类型" :edit-render="{}">
            <template #default="{ row }">
              <span>{{ projectFormat(row) }}</span>
            </template>
            <template #edit="{ row }">
              <vxe-select v-model="row.projectType" clearable>
                <vxe-option v-for="item in projectOptions" :value="item.dictValue" :label="`${item.dictLabel}`"
                  :key="item.dictValue"></vxe-option>
              </vxe-select>
            </template>
          </vxe-column>
          <vxe-column field="inspectRank" title="程度" :edit-render="{}">
            <template #default="{ row }">
              <span>{{ rankFormat(row) }}</span>
            </template>
            <template #edit="{ row }">
              <vxe-select v-model="row.inspectRank" clearable>
                <vxe-option v-for="item in rankOptions" :value="item.value" :label="`${item.label}`"
                  :key="item.value"></vxe-option>
              </vxe-select>
            </template>
          </vxe-column>
          <vxe-column field="quantity" title="数量" :edit-render="{}">
            <template #edit="{ row }">
              <vxe-input v-model="row.quantity" type="number"></vxe-input>
            </template>
          </vxe-column>
          <vxe-column field="imagePath" title="图片" :edit-render="{}">
            <template slot-scope="scope">
              <el-image style="width: 130px; height: 110px;color:#fff" fit="fill" :src="scope.row.imagePath"
                z-index="9999" :preview-src-list="[scope.row.imagePath]"></el-image>
            </template>
            <template #edit="{ row }">
              <ImageUpload v-model="row.imagePath"></ImageUpload>
            </template>
          </vxe-column>
          <vxe-column title="操作" width="140" fixed="right">
            <template #default="{ row }">
              <template v-if="$refs.xTable.isEditByRow(row)">
                <vxe-button @click="saveRowEvent(row)">保存</vxe-button>
                <vxe-button @click="cancelRowEvent(row)">取消</vxe-button>
              </template>
              <template v-else>
                <vxe-button @click="editRowEvent(row)">编辑</vxe-button>
              </template>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  selectEmbinspectionList,
  getEmbinspection,
  addEmbinspection,
  updateEmbinspection,
  delEmbinspection,
} from "@/api/purchase/embinspection";
import { selectProductName } from "@/api/purchase/bom";
import { getToken } from "@/utils/auth";
import VXETable from "vxe-table";
export default {
  name: "Embinspection",
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
      // 表格数据
      feedBillList: [],
      excelData: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
      // 表单参数
      form: {
        imagePath: undefined,
        projectBeans: []
      },
      bomList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: undefined,
        cuttingCode: undefined,
      },
      rankOptions: [
        { value: "01", label: "轻微" },
        { value: "02", label: "严重" },
      ],
      projectOptions: [],
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
        ],
      },
      // 表格校验
      validRules: {
        cuttingCode: [
          { required: true, message: "裁片编号不能为空！" }
        ],
      },
      showFields: [{ title: "产品名称", data: "productName" }],
    };
  },
  created() {
    this.initProjectDitc();
    this.getList();
    this.initBomList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 280;
      const $table = this.$refs;
    })
  },
  methods: {
    initBomList() {
      selectProductName({ pageNum: 1, pageSize: 800 }).then((response) => {
        this.bomList = response.rows;
      });
    },
    initProjectDitc() {
      this.getDicts("inspect_project_type").then((response) => {
        this.projectOptions = response.data;
      });
    },
    handleImage(row) {
      this.dialogVisible = true;
      this.imagePathScope = row.imagePath;
    },
    handleSingleValues(data) {
      // 数据监听
      if (data !== undefined && data.length > 0) {
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectEmbinspectionList(this.queryParams).then((response) => {
        this.feedBillList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.form = {};
      this.excelData = [];
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
      this.ids = selection.map((item) => item.embinspectId);
      // this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const embinspectId = row.embinspectId;
      getEmbinspection(embinspectId).then((response) => {
        this.form = response.data;
        this.excelData = response.data.projectBeans
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const $table = this.$refs.xTable;
          this.form.projectBeans = $table.afterFullData;
          if (this.form.embinspectId != undefined) {
            updateEmbinspection(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.cancel();
              this.getList();
            });
          } else {
            addEmbinspection(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.cancel();
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.embinspectId || this.ids;
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delEmbinspection(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
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
    //字典翻译
    rankFormat(row, column) {
      if (row.inspectRank == null) {
        return
      }
      return row.inspectRank === "01" ? "轻微" : "严重";
    },
    projectFormat(row, column) {
      return this.selectDictLabel(this.projectOptions, row.projectType);
    },
    async insertEvent() {
      const $table = this.$refs.xTable;
      const { row: newRow } = await $table.insert();
    },
    editRowEvent(row) {
      const $table = this.$refs.xTable;
      $table.setEditRow(row);
    },
    saveRowEvent() {
      const $table = this.$refs.xTable;
      $table.clearEdit().then(() => {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
        }, 300);
      });
    },
    cancelRowEvent(row) {
      const $table = this.$refs.xTable;
      $table.clearEdit().then(() => {
        // 还原行数据
        $table.revertData(row);
      });
    },
  },
};
</script>
<style scoped lang="scss">
.el-select {
  width: 100%;
}

.el-input-number {
  width: 100%;
}

.v-selectpage {
  width: 100%;
}

.el-input {
  width: 100%;
}

.el-date-picker {
  width: 100%;
}

.mytable-scrollbar {
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
  }
}

avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>