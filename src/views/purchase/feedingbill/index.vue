<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="订单号" prop="orderCode">
            <el-input v-model="queryParams.orderCode" placeholder="订单号" clearable size="small" style="width: 240px" />
          </el-form-item>
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
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :disabled="multiple"
              @click="handleExportStatistic">投料统计导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="feedBillList" :height="tableHeight" ref="multipleTable"
          @selection-change="handleSelectionChange" border :row-style="{ height: '45px' }"
          :cell-style="{ padding: '0px' }" style="font-size: 13px">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="订单号" align="center" prop="orderCode">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleDetail(scope.row)">{{
                scope.row.orderCode
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
          <el-table-column label="订单总数" align="center" prop="orderTotalNum" />
          <el-table-column label="每组数量" align="center" prop="eachGroupNum" />
          <el-table-column label="组数" align="center" prop="groupNum" />
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
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderCode">
              <el-input v-model="form.orderCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单总数" prop="orderTotalNum">
              <el-input-number v-model="form.orderTotalNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <v-selectpage :data="bomList" show-field="productName" key-field="productName" v-model="form.productName"
                :pagination="true" :tb-columns="showFields" title="BOM产品列表" language="cn" :result-format="resultFormat"
                @values="handelSingleValues" class="form-control">
              </v-selectpage>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每组数量" prop="eachGroupNum">
              <el-input-number v-model="form.eachGroupNum" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="组数" prop="groupNum">
              <el-input-number v-model="form.groupNum" placeholder="请输入" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(item, index) in form.dynamicItem" :key="index">
          <el-col :span="12">
            <el-form-item :label="'生产地' + index" :prop="'dynamicItem.' + index + '.productPlace'">
              <el-select v-model="item.productPlace" placeholder="请选择">
                <el-option v-for="option in options" :value="option.value" :label="option.label"
                  :key="option.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="'分配组数' + index" :prop="'dynamicItem.' + index + '.assignGroupNum'">
              <el-input-number v-model="item.assignGroupNum" style="width: 56%"></el-input-number>
              <el-button v-if="index + 1 == form.dynamicItem.length" @click="addItem" type="primary">增加</el-button>
              <el-button v-if="index >= 1" @click="deleteItem(item, index)" type="danger">删除</el-button>
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
  addFeedingbill,
  delFeedingbill,
  exportFeedingbill,
  getFeedingbill,
  selectFeedingbillList,
  updateFeedingbill,
} from "@/api/purchase/feedingbill";
import { exportPickingStatistics } from "@/api/purchase/pickingbill";
import { Message } from "element-ui";
export default {
  name: "Feedingbill",
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
      feedBillList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 显示查看器
      showViewer: false,
      // 表单参数
      form: {
        dynamicItem: [
          {
            assignGroupNum: undefined,
            productPlace: undefined,
          },
        ],
      },
      bomList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: undefined,
        orderCode: undefined,
      },
      // 表单校验
      rules: {
        productName: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
        ],
      },
      options: [
        { value: "S", label: "S" },
        { value: "H", label: "H" },
        { value: "I", label: "I" },
        { value: "K", label: "K" },
      ],
      showFields: [{ title: "产品名称", data: "productName" }],
    };
  },
  watch: {
    form: {
      handler(val, oldVal) {
        if (
          val.orderTotalNum != null &&
          val.eachGroupNum != null &&
          val.eachGroupNum !== 0
        ) {
          this.form.groupNum =
            Math.round(
              (val.orderTotalNum / val.eachGroupNum + Number.EPSILON) * 100
            ) / 100;
        } else {
          this.form.groupNum = null;
        }
      },
      deep: true,
    },
  },
  created() {
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
    handleDetail(row) {
      const productName = row.productName;
      const orderCode = row.orderCode;
      this.$router.push({
        //核心语句
        path: "feedstatistics", //跳转的路由
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          productName: productName,
          orderCode: orderCode
        },
      });
    },
    initBomList() {
      selectProductName({ pageNum: 1, pageSize: 800 }).then((response) => {
        this.bomList = response.rows;
      });
    },
    addItem() {
      if (this.form.dynamicItem.length === 4) {
        Message.warning("最多只能增加四个生产地！");
      } else {
        this.form.dynamicItem.push({
          feedingId: this.form.feedingId,
          assignGroupNum: undefined,
          productPlace: undefined,
        });
      }
    },
    sure(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          alert("error!");
          return false;
        }
      });
    },
    deleteItem(item, index) {
      this.form.dynamicItem.splice(index, 1);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      selectFeedingbillList(this.queryParams).then((response) => {
        this.feedBillList = response.rows;
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
      this.form = {
        productName: undefined,
        orderCode: undefined,
        eachGroupNum: undefined,
        orderTotalNum: undefined,
        groupNum: undefined,
        dynamicItem: [
          {
            assignGroupNum: undefined,
            productPlace: undefined,
          },
        ],
      };
      this.resetForm("form");
    },
    /** 初始化动态值 */
    initDynamicItem() {
      this.form.dynamicItem = [
        {
          assignGroupNum: undefined,
          productPlace: undefined,
        },
      ];
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
      this.ids = selection.map((item) => item.feedingId);
      this.form.orderCode = selection.map((item) => item.orderCode);
      if (selection.length > 1) {
        this.$refs.multipleTable.clearSelection();
        this.$refs.multipleTable.toggleRowSelection(selection.pop());
      }
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
      this.reset();
      const feedingId = row.feedingId;
      getFeedingbill(feedingId).then((response) => {
        this.form = response.data;
        if (!this.form.dynamicItem) {
          this.initDynamicItem();
        }
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.feedingId != undefined) {
            updateFeedingbill(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addFeedingbill(this.form).then((response) => {
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
      const ids = row.feedingId || this.ids;
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delFeedingbill(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportFeedingbill(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    handleExportStatistic() {
      const orderCode = this.form.orderCode;
      this.$confirm("是否确认导出所有数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportPickingStatistics(orderCode);
        })
        .then((response) => {
          this.exportExcel("投料统计表-" + orderCode, response);
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
    handelSingleValues(data) {
      // if (data !== undefined && data.length > 0) {
      //   this.form.productName = data[0].productName;
      // }
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