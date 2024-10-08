<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="类型" prop="type">
            <el-select v-model="queryParams.type" placeholder="请选择" @change="handleOptionChange">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="编号" prop="productCode">
            <el-input v-model="queryParams.productCode" placeholder="编号" clearable size="small" style="width: 240px" />
          </el-form-item>
          <el-form-item label="名称" prop="productName">
            <el-input v-model="queryParams.productName" placeholder="名称" clearable size="small" style="width: 240px" />
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

        <el-table v-loading="loading" border :height="tableHeight" :row-style="{ height: '45px' }"
          :cell-style="{ padding: '0px' }" style="font-size: 13px" :data="productList"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column label="类型" align="center" prop="type" :formatter="statusFormat" />
          <el-table-column label="编号" align="center" prop="productCode" />
          <el-table-column label="名称" align="center" prop="productName" />
          <el-table-column label="限额数" align="center" prop="totalAmount" />
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button v-if="scope.row.userId !== 1" size="mini" type="text" icon="el-icon-edit"
                @click="handleUpdate(scope.row)">编辑</el-button>
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
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择" disabled>
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编号" prop="productCode">
              <el-input v-model="form.productCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="限额数" prop="totalAmount">
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
  </div>
</template>

<script>
import {
  selectProductList,
  getProductManager,
  addProductManager,
  updateProductManager,
  delProductManager,
} from "@/api/purchase/productmanager";

export default {
  name: "ProductManager",
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
      productList: null,
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
        type: "0",
        productCode: undefined,
        productName: undefined,
      },
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "名称不能为空", trigger: "blur" },
        ],
        productCode: [
          { required: true, message: "编号不能为空", trigger: "blur" },
        ],
      },
      options: [
        {
          value: "0",
          label: "产品",
        },
        {
          value: "1",
          label: "绣花厂",
        },
        {
          value: "2",
          label: "生产地",
        },
        {
          value: "3",
          label: "模板关联",
        },
      ],
      // 列信息
      columns: [{ key: 0, label: `限额数`, visible: true }],
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
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectProductList(this.queryParams).then((response) => {
        this.productList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    //字典翻译
    statusFormat(row, column) {
      if (row.type == "0") {
        return "产品";
      } else if (row.type == "1") {
        return "绣花厂";
      } else if (row.type == "2") {
        return "生产地";
      } else {
        return "模板关联";
      }
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        productName: undefined,
        productCode: undefined,
      };
      this.resetForm("form");
    },
    handleOptionChange(value) {
      this.queryParams.page = 1;
      this.getList();
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
      this.ids = selection.map((item) => item.productId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.title = "添加";
      this.form.type = this.queryParams.type;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const productId = row.productId;
      getProductManager(productId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.productId != undefined) {
            updateProductManager(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProductManager(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.reset();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.productId || this.ids;
      this.$confirm('是否确认删除物料ID为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delProductManager(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
  },
};
</script>