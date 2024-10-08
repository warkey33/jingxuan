<template>
  <div class="app-container clearfix">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="柜号" prop="cabinetNum">
            <el-input v-model="queryParams.cabinetNum" placeholder="请输入" clearable size="small" style="width: 240px" />
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
              @click="handleExport">缝纫领料单导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" ref="multipleTable" :height="tableHeight" :data="sewPickList"
          @selection-change="handleSelectionChange" border :row-style="{ height: '45px' }"
          :cell-style="{ padding: '0px' }" style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="车间" align="center" prop="workshop" :formatter="statusFormat" />
          <el-table-column label="领料日期" align="center" prop="pickDate">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.pickDate
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="柜号" align="center" prop="cabinetNum">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.cabinetNum
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
          <el-table-column label="生产地" align="center" prop="productPlace" />
          <el-table-column label="组数" align="center" prop="groupNum" />
          <el-table-column label="裁片编号" align="center" prop="cuttingCode" />
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" :disabled="scope.row.isAssigned"
                @click="handleUpdate(scope.row)">修改</el-button>
              <el-button size="mini" icon="el-icon-" v-if="!scope.row.isAssigned" type="text"
                @click="confirmAssigned(scope.row, scope.$index)">确认分配</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false"
      :showClose="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="柜号" prop="cabinetNum">
              <el-input v-model="form.cabinetNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="裁片编号" prop="cuttingCode" v-if="showViewer">
              <v-selectpage :data="cuttingtList" ref="xCuttingCode" show-field="cuttingCode" key-field="cuttingCode"
                v-model="form.cuttingCode" :tb-columns="showCodeFields" title="裁片列表" :result-format="resultFormat"
                class="form-control" :multiple="true" language="cn" :pagination="true">
              </v-selectpage>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="领料日期" prop="pickDate">
              <el-date-picker v-model="form.pickDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                class="picker-width">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <v-selectpage :data="productList" ref="xProduct" show-field="productName" key-field="productName"
                v-model="form.productName" :tb-columns="showFields" title="BOM产品列表" language="cn"
                :result-format="resultFormat" class="form-control" :pagination="true">
              </v-selectpage>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="车间" prop="workshop">
              <el-select v-model="form.workshop">
                <el-option label="缝纫车间" value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产地" prop="productPlace">
              <el-select v-model="form.productPlace" placeholder="请选择" filterable>
                <el-option v-for="item in placeOptions" :label="item" :key="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="组数" prop="groupNum">
              <el-input-number v-model="form.groupNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

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
          <el-link type="info" style="font-size: 12px" @click="downloadTemplate">下载模板</el-link>
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
  selectSewPickBillList,
  selectCuttingCodeList,
  getSewPickBill,
  addSewPickBill,
  updateSewPickBill,
  delSewPickBill,
  importTemplate,
  exportSewBill,
} from "@/api/purchase/sewpickbill";
import { getToken } from "@/utils/auth";
import { selectProductName } from "@/api/purchase/bom";
import { selectUnfinishedPick } from "@/api/purchase/pickingbill";

export default {
  name: "Sewpickbill",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      sewObjs: [],
      // 非多个禁用
      multiple: true,
      tableHeight: 0,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 生产地
      placeOptions: ["S", "H", "I", "K"],
      cuttingtList: [],
      sewPickList: [],
      productList: [],
      showFields: [{ title: "产品名称", data: "productName" }],
      showCodeFields: [{ title: "裁片编号", data: "cuttingCode" }],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
      // 表单参数
      form: {
        isAssigned: undefined,
        cuttingCode: undefined,
        workshop: undefined,
      },
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
      // 表单校验
      rules: {
        pickDate: [
          { required: true, message: "领料日期不为空", trigger: "blur" },
        ],
        workshop: [
          { required: true, message: "车间不能为空", trigger: "blur" },
        ],
        cabinetNum: [
          { required: true, message: "柜号不能为空", trigger: "blur" },
        ],
        productPlace: [
          { required: true, message: "生产地不能为空", trigger: "blur" },
        ],
        productName: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
        ],
        groupNum: [
          { required: true, message: "组数不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUnfinishedCabinetMessage();
    this.initBomList();
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
      selectSewPickBillList(this.queryParams).then((response) => {
        this.sewPickList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getUnfinishedCabinetMessage() {
      selectUnfinishedPick().then((response) => {
        this.$notify({
          title: "您还有未完成领料的柜号：",
          message: response.msg,
          duration: 1000000,
          type: "warning",
          offset: 50,
          dangerouslyUseHTMLString: true,
          message: response.msg,
        });
      });
    },
    initBomList() {
      selectProductName({ pageNum: 1, pageSize: 800 }).then((response) => {
        this.productList = response.rows;
      });
    },
    handleDetail(row) {
      const sewId = row.sewId;
      const productName = row.productName;
      this.$router.push({
        //核心语句
        path: "sewpickbilldetail", //跳转的路由
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          sewId: sewId,
          productName: productName,
        },
      });
    },
    getCuttingCodes(row) {
      selectCuttingCodeList(row).then((response) => {
        this.cuttingtList = response.rows;
      });
    },
    //禁用
    confirmAssigned(row, currentIndex) {
      const param = row;
      param.isAssigned = true;
      updateSewPickBill(param)
        .then((response) => {
          if (response.code == 200) {
            this.$set(this.sewPickList[currentIndex], "isAssigned", true);
            this.getList();
          } else {
            this.$set(this.sewPickList[currentIndex], "isAssigned", false);
          }
        })
        .catch((error) => {
          this.$set(this.sewPickList[currentIndex], "isAssigned", false);
          console.error(error);
        });
    },
    handelSingleValues(data) {

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
    statusFormat(row, column) {
      return row.workshop == "0" ? "缝纫车间" : "其它车间";
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
      this.ids = selection.map((item) => item.sewId);
      this.sewObjs = selection.map((item) => item);
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.showViewer = false;
      this.form.workshop = "0";
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      getSewPickBill(row.sewId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.showViewer = true;
        this.title = "修改";
      });
      this.getCuttingCodes(row);
    },
    reset() {
      this.form = {};
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.sewId != undefined) {
            updateSewPickBill(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSewPickBill(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.getList();
              this.cancel();
            });
          }
        }
      });
    },
    // 取消按钮
    cancel() {
      this.$refs.xProduct.remove();
      this.open = false;
      this.reset();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.sewId || this.ids;
      this.$confirm('是否确认删除ID为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delSewPickBill(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    downloadTemplate() {
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
      exportSewBill(this.sewObjs[0]).then((response) => {
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

.v-selectpage {
  // padding: 3px 24px 0 3px;
  position: relative;
  overflow: hidden;
  /* clear: both; */
  cursor: pointer;
  list-style: none;
  // height: auto;
  // min-height: 34px;
  font-size: 14px;
}
</style>