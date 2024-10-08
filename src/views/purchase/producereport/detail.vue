<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="工序" prop="processCode">
            <el-select v-model="queryParams.processCodes" multiple placeholder="请选择" size="small">
              <el-option v-for="processCode in processList" :key="processCode" :value="processCode">{{ processCode
                }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="序号" prop="seq">
            <el-input v-model="queryParams.seq" clearable size="small" />
          </el-form-item>
          <el-form-item label="花片号" prop="goboCode">
            <el-input v-model="queryParams.goboCode" placeholder="花片号" clearable size="small" />
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
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
        </el-row>

        <el-table v-loading="loading" border :height="tableHeight" :data="produceReportList" ref="multipleTable"
          @selection-change="handleSelectionChange" :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          >
          <el-table-column type="selection" align="center" />
          <el-table-column label="柜号" align="center" prop="workOrderCode" />
          <el-table-column label="序号" align="center" prop="seq" />
          <el-table-column label="产品名称" align="center" prop="productName" />
          <el-table-column label="生产地" align="center" prop="productPlace" />
          <el-table-column label="工序" align="center" prop="processCode" />
          <el-table-column label="花片号" align="center" prop="goboCode" />
          <el-table-column label="良品数" align="center" prop="goodsNum" />
          <el-table-column label="报工日期" align="center" prop="reportDate" width="150">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.reportDate, "{y}-{m}-{d}") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" align="center" prop="createBy" />
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
    <el-dialog :title="title" :visible.sync="open" width="600px" :show-close="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="柜号" prop="workOrderCode">
              <el-input v-model="form.workOrderCode" placeholder="请输入" disabled />
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
            <el-form-item label="生产地" prop="productPlace">
              <el-input v-model="form.productPlace" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序" prop="processCode">
              <el-select v-model="form.processCode" placeholder="请选择" size="small">
                <el-option v-for="processCode in processList" :key="processCode" :value="processCode">{{ processCode
                  }}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="良品数" prop="goodsNum">
              <el-input v-model="form.goodsNum" type="number" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报工日期" prop="reportDate">
              <el-date-picker v-model="form.reportDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  selectProduceReportDetailList,
  selectCabinetList,
  selectProcessList,
  getProduceReport,
  updateProduceReport,
  addProduceReport,
  delReportId,
} from "@/api/purchase/producereport";
import VueDatepickerLocal from "vue-datepicker-local";

export default {
  name: "ProduceReportDetail",
  components: {
    VueDatepickerLocal,
  },
  data() {
    return {
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
      // 表格数据
      produceReportList: [],
      cabinetList: [],
      processList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        processCodes: undefined,
        productName: undefined,
      },
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
        ],
        goodsNum: [
          { required: true, message: "良品数不能为空", trigger: "blur" },
        ],
        processCode: [
          { required: true, message: "工序不能为空", trigger: "blur" },
        ],
        reportDate: [
          { required: true, message: "报工日期不能为空", trigger: "blur" }
        ]
      },
    };
  },
  created() {
    this.getList();
    this.getCabinetList();
    this.getProcessList();
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
      this.queryParams.productName = this.$route.query.productName;
      this.queryParams.workOrderCode = this.$route.query.workOrderCode;
      this.queryParams.productPlace = this.$route.query.productPlace;
      this.queryParams.startDate = this.$route.query.startDate;
      this.queryParams.endDate = this.$route.query.endDate;
      selectProduceReportDetailList(this.queryParams).then((response) => {
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
        processCode: undefined,
        workOrderCode: undefined,
        productName: undefined,
        productPlace: undefined,
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.reportId);
      this.single = selection.length != 1;
      this.multipleSelection = selection;
      this.multiple = !selection.length;
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.reportId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加";
      this.form.workOrderCode = this.queryParams.workOrderCode;
      this.form.productName = this.queryParams.productName;
      this.form.productPlace = this.queryParams.productPlace;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const reportId = row.reportId;
      getProduceReport(reportId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.reportId != undefined) {
            updateProduceReport(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProduceReport(this.form).then((response) => {
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
      const ids = row.reportId || this.ids;
      this.$confirm('是否确认删除为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delReportId(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>
