<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="产品名称" clearable size="small"
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
        <el-table v-loading="loading" :height="tableHeight" :data="allList" ref="multipleTable"
          @selection-change="handleSelectionChange" :row-style="{ height: '45px' }" :cell-style="{ padding: '0px' }"
          style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="检验日期" align="center" prop="inspectDate" />
          <el-table-column label="产品名称" align="center" prop="productName" />
          <el-table-column label="检验编码" align="center" prop="insCode" />
          <el-table-column label="数量" align="center" prop="quantity" />
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
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false"
      :showClose="false" @open="onOpen">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="检验日期" prop="inspectDate">
              <el-date-picker v-model="form.inspectDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <v-selectpage :data="productList" show-field="productName" key-field="productName" ref="xProduct"
                v-model="form.productName" :pagination="true" :tb-columns="showFields" title="产品列表" language="cn"
                :result-format="resultFormat" @values="handleSingleValues" class="form-control">
              </v-selectpage>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="检验编码" prop="insCode">
              <v-selectpage :data="insList" show-field="insCode" key-field="insCode" v-model="form.insCode"
                ref="xInsCode" :pagination="true" :tb-columns="showInsFields" title="检验编码列表" language="cn"
                :result-format="resultFormat" class="form-control">
              </v-selectpage>
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
import {
  selectAllList,
  getInfo,
  add,
  update,
  del,
} from "@/api/purchase/fabricinspection";
import { selectProductList, selectInsCodeList } from "@/api/purchase/fabricinspectbill";
export default {
  name: "Fabricinspection",
  data() {
    return {
      // 遮罩层
      loading: true,
      dialogVisible: false,
      // 选中数组
      ids: [],
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
      allList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
      // 表单参数
      form: {
        quantity: 8,
      },
      productList: [],
      insList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: undefined,
      },
      queryCascaderParams: {},
      projectOptions: [],
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
        ],
        inspectDate: [
          { required: true, message: "日期不能为空", trigger: "blur" },
        ],
      },
      showFields: [{ title: "产品名称", data: "productName" }],
      showInsFields: [{ title: "检验编码", data: "insCode" }],
    };
  },
  created() {
    this.initProjectDict();
    this.initproductList();
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
    initproductList() {
      selectProductList().then((response) => {
        this.productList = response.rows;
      });
    },
    initProjectDict() {
      this.getDicts("fabric_inspection_conclusion").then((response) => {
        this.projectOptions = response.data;
      });
    },
    handleSingleValues(data) {
      if (data.length > 0) {
        this.queryCascaderParams.productName = data[0].productName;
        this.queryCascaderParams.bottlesResult = '1';
        selectInsCodeList(this.queryCascaderParams).then((response) => {
          this.insList = response.rows;
        });
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectAllList(this.queryParams).then((response) => {
        this.allList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.$refs.xProduct.remove();
      this.$refs.xInsCode.remove();
      this.form = {};
    },
    onOpen() {
      this.$nextTick(() => {
        this.$refs;
      })
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
      this.ids = selection.map((item) => item.fabricId);
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const fabricId = row.fabricId;
      getInfo(fabricId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.fabricId != undefined) {
            update(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.cancel();
            });
          } else {
            add(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.cancel();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.fabricId || this.ids;
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return del(ids);
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

.el-date-picker {
  width: 100%;
}

.el-input-number {
  width: 100%;
}
</style>