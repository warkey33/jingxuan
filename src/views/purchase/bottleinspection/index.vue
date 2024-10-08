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
        <el-table v-loading="loading" :height="tableHeight" border :data="feedBillList" ref="multipleTable"
          @selection-change="handleSelectionChange" :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="检验日期" align="center" prop="inspectDate" />
          <el-table-column label="产品名称" align="center" prop="productName" />
          <el-table-column label="柜号" align="center" prop="cabinetNum" />
          <el-table-column label="裁片编号" align="center" prop="cuttingCode" />
          <el-table-column label="吊瓶数" align="center" prop="bottleNum" />
          <el-table-column label="结论" align="center" prop="conclusion" :formatter="projectFormat" />

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
    <el-dialog :title="title" :visible.sync="open" width="650px" append-to-body :close-on-click-modal="false"
      :showClose="false" @open="onOpen">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="检验日期" prop="inspectDate">
              <el-date-picker v-model="form.inspectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                class="picker-width" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <v-selectpage :data="bomList" ref="xProduct" show-field="productName" key-field="productName"
                v-model="form.productName" :pagination="true" :tb-columns="showFields" title="BOM产品列表" language="cn"
                :result-format="resultFormat" @values="handleSingleValues" class="form-control">
              </v-selectpage>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="柜号" prop="cabinetNum">
              <el-select v-model="form.cabinetNum" placeholder="请选择" size="small" @change="changeCabinet">
                <el-option v-for="cabinetNum in cabinetList" :key="cabinetNum" :value="cabinetNum">{{ cabinetNum
                  }}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="裁片编号" prop="cuttingCode">
              <el-select v-model="form.cuttingCode" placeholder="请选择" size="small">
                <el-option v-for="cuttingCode in cuttingList" :key="cuttingCode" :value="cuttingCode">{{ cuttingCode
                  }}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="吊瓶数" prop="bottleNum">
              <el-input-number v-model="form.bottleNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结论" prop="conclusion">
              <el-select v-model="form.conclusion" placeholder="请选择" filterable>
                <el-option v-for="item in projectOptions" :value="item.dictValue" :label="item.dictLabel"
                  :key="item.dictValue"></el-option>
              </el-select>
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
import { selectProductName } from "@/api/purchase/bom";
import {
  addBottlebinspection,
  delBottlebinspection,
  getBottlebinspection,
  selectBottleinspectionList,
  updateBottlebinspection,
} from "@/api/purchase/bottleinspection";
import {
  selectCabinetList,
  selectCuttingcodeList,
} from "@/api/purchase/pickingplanbill";
export default {
  name: "Bottlebinspection",
  data() {
    return {
      // 遮罩层
      loading: true,
      dialogVisible: false,
      // 选中数组
      ids: [],
      cabinetList: [],
      cuttingList: [],
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
      feedBillList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
      // 表单参数
      form: {
        productName: undefined,
        cabinetNum: undefined,
        cuttingCode: undefined,
        bottleNum: 5,
      },
      bomList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: undefined,
        cuttingCode: undefined,
      },
      queryCascaderParams: {},
      projectOptions: [],
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
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
      selectProductName({ pageNum: 1, pageSize: 1000 }).then((response) => {
        this.bomList = response.rows;
      });
    },
    initProjectDitc() {
      this.getDicts("bottle_inspection_conclusion").then((response) => {
        this.projectOptions = response.data;
      });
    },
    handleSingleValues(data) {
      if (data.length > 0) {
        this.queryCascaderParams.productName = data[0].productName;
        selectCabinetList(this.queryCascaderParams).then((response) => {
          this.cabinetList = response.rows;
        });
      }
    },
    onOpen() {
      this.$nextTick(() => {
        this.$refs;
      })
    },
    changeCabinet(val) {
      this.queryCascaderParams.cabinetNum = val;
      selectCuttingcodeList(this.queryCascaderParams).then((response) => {
        this.cuttingList = response.rows;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectBottleinspectionList(this.queryParams).then((response) => {
        this.feedBillList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.$refs.xProduct.remove();
    },
    // 表单重置
    reset() {
      this.form = {}
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
      this.ids = selection.map((item) => item.bottleId);
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
      const bottleId = row.bottleId;
      getBottlebinspection(bottleId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.bottleId != undefined) {
            updateBottlebinspection(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.cancel();
              this.getList();
            });
          } else {
            addBottlebinspection(this.form).then((response) => {
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
      const ids = row.bottleId || this.ids;
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delBottlebinspection(ids);
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
    projectFormat(row, column) {
      return this.selectDictLabel(this.projectOptions, row.conclusion);
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

.el-date-picker {
  width: 100%;
}
</style>