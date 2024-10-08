<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="单据编号" prop="billcode">
            <el-input v-model="queryParams.billcode" placeholder="单据编号" clearable size="small" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
              @click="handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport">导入</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :height="tableHeight" border :data="bomList"
          @selection-change="handleSelectionChange" :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="单据编号" align="center" prop="billcode">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.billcode
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="单据日期" align="center" prop="billdate">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.billdate
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
          <el-table-column label="生产地" align="center" prop="productPlace">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.productPlace
              }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="总数" align="center" prop="totalNum" />
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
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
  selectBillcodeList,
  delBillCodeList,
  importTemplate
} from "@/api/purchase/pickingbill";
import { getToken } from "@/utils/auth";

export default {
  name: "Pickingbill",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      billcodes: [
        { billcode: "", billdate: "", cabinetNum: "", productPlace: "" },
      ],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      tableHeight: 0,
      // 表格数据
      bomList: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
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
        url: process.env.VUE_APP_BASE_API + "/purchase/pickingbill/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
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
    handleDetail(row) {
      const billcode = row.billcode;
      const billdate = row.billdate;
      const cabinetNum = row.cabinetNum;
      const productPlace = row.productPlace;
      this.$router.push({
        //核心语句
        path: "pickingbilldetail", //跳转的路由
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          billcode: billcode,
          billdate: billdate,
          cabinetNum: cabinetNum,
          productPlace: productPlace
        }
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectBillcodeList(this.queryParams).then((response) => {
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
      this.billcodes = selection;
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let obj = [];
      if ("billcode" in row) {
        obj.push(row);
      } else {
        obj = [].concat(this.billcodes);
      }
      this.$confirm("是否确认删除数据?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function () {
          return delBillCodeList(obj);
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