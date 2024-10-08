<template>
  <div>
    <vxe-toolbar ref="xToolbar" :loading="loading">
      <template #buttons>
        <vxe-button size="mini" status="danger" content="提交" @click="saveEvent"></vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-table border resizable show-footer :height="tableHeight" keep-source class="mytable-scrollbar" size="mini"
      ref="xTable" :loading="loading" :data="tableData" :edit-config="{
        mode: 'row',
        showUpdateStatus: true,
        showInsertStatus: true,
      }">
      >
      <vxe-column type="checkbox" width="50"></vxe-column>
      <vxe-column field="cuttingCode" title="裁片编号">
        <template #edit="{ row }">
          <vxe-input v-model="row.cuttingCode" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="hangingBottle" title="吊瓶">
        <template #default="{ row }">
          <span>{{ formatSex(row.hangingBottle) }}</span>
        </template>
        <template #edit="{ row }">
          <vxe-select v-model="row.hangingBottle" type="text" :options="sexList" transfer clearable></vxe-select>
        </template>
      </vxe-column>
      <vxe-column field="cabinetNum" title="柜号" :visible="false">
        <template #edit="{ row }">
          <vxe-input v-model="row.cabinetNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="groupNum" title="组数" :visible="false">
        <template #edit="{ row }">
          <vxe-input v-model="row.groupNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="productName" title="产品名称" :visible="false">
        <template #edit="{ row }">
          <vxe-input v-model="row.productName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="pickingDate" title="领料时间" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.pickingDate" type="date" clearable placeholder="请选择日期" transfer></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="embrFactory" title="绣花厂" :edit-render="{}">
        <template #default="{ row }">
          <span>{{ row.embrFactory }}</span>
        </template>
        <template #edit="{ row }">
          <vxe-select v-model="row.embrFactory" type="text" transfer clearable>
            <vxe-option v-for="item in bomList" :key="item.productCode" :value="item.productName"
              :label="`${item.productName}`"></vxe-option>
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column field="takeBackDate" title="收回时间" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.takeBackDate" clearable type="date" placeholder="请选择日期" transfer></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="takeBackNum" title="收回片数" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.takeBackNum" clearable type="number" placeholder="请输入数值"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="changeNum" title="换片总重" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.changeNum" type="number" placeholder="请输入数值"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="filledShortNum" title="缺料总数" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.filledShortNum" type="number" placeholder="请输入数值"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="cardNo" title="卡号" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.cardNo" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="inspect" title="检验" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.inspect" type="text"></vxe-input>
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
</template>

<script>
import VXETable from "vxe-table";
import { selectPickplanbillList } from "@/api/purchase/pickingplanbill";
import { selectProductList } from "@/api/purchase/productmanager";
import { getToken } from "@/utils/auth";
export default {
  name: "Embroideryarea",
  data() {
    return {
      queryParams: {},
      // 表格数据
      tableData: [],
      sexList: [
        { label: "合格", value: "1" },
        { label: "失败", value: "0" },
      ],
      bomList: [],
      tableHeight: 0,
    };
  },
  created() {
    this.initProductList();
    this.loadList();
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
    async loadList() {
      this.loading = true;
      this.queryParams.cabinetNum = this.$route.query.cabinetNum;
      this.queryParams.productName = this.$route.query.productName;
      this.queryParams.groupNum = this.$route.query.groupNum;
      selectPickplanbillList(this.queryParams).then((response) => {
        this.tableData = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    formatSex(value) {
      if (value === "1") {
        return "合格";
      }
      if (value === "0") {
        return "失败";
      }
      return "";
    },
    formatMultiSex(values) {
      if (values) {
        return values.map((val) => this.formatSex(val)).join(",");
      }
      return "";
    },
    initProductList() {
      selectProductList({ type: "1", pageNum: 1, pageSize: 100 }).then(
        (response) => {
          this.bomList = response.rows;
        }
      );
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
          VXETable.modal.message({ content: "保存成功！", status: "success" });
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
    async insertEvent() {
      const $table = this.$refs.xTable;
      const { row: newRow } = await $table.insert();
      // 插入一条数据并触发校验
      newRow.cabinetNum = this.queryParams.cabinetNum;
      newRow.groupNum = this.queryParams.groupNum;
      newRow.productName = this.queryParams.productName;
      const errMap = await $table.validate(newRow).catch((errMap) => errMap);
      if (errMap) {
        // 校验不通过
      }
    },
    async saveEvent() {
      const $table = this.$refs.xTable;
      const resultValue = $table.afterFullData;
      const flag = resultValue.every((element) => {
        if (element.cuttingNum < element.takeBackNum) {
          VXETable.modal.message({
            content:
              "【收回片数】不能大于【裁片数】！裁片编号：" +
              element.cuttingCode,
            status: "error",
            duration: 6000,
          });
          return false;
        } else if (element.takeBackNum < element.outWarehoseNum) {
          VXETable.modal.message({
            content:
              "【出库数量】不能大于【收回片数】！裁片编号：" +
              element.cuttingCode,
            status: "error",
            duration: 6000,
          });
          return false;
        } else if (
          element.hangingBottle == "0" &&
          (element.pickingDate || element.outWarehoseNum)
        ) {
          VXETable.modal.message({
            content:
              "【吊瓶】不合格，不能填写【领料时间】、【出库数量】！裁片编号：" +
              element.cuttingCode,
            status: "error",
            duration: 6000,
          });
          return false;
        } else {
          return true;
        }
      });
      if (!flag) {
        return;
      }
      const { insertRecords, removeRecords, updateRecords } =
        $table.getRecordset();
      if (
        insertRecords.length <= 0 &&
        removeRecords.length <= 0 &&
        updateRecords.length <= 0
      ) {
        VXETable.modal.message({ content: "数据未改动！", status: "warning" });
        return;
      }
      const errMap = await $table.validate().catch((errMap) => errMap);
      if (errMap) {
        return;
      }
      this.loading = true;
      try {
        const body = { insertRecords, removeRecords, updateRecords };
        await fetch(
          `${process.env.VUE_APP_BASE_API}/purchase/pickingplanbill/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getToken(),
            },
            body: JSON.stringify(body),
          }
        );
        await this.loadList();
        VXETable.modal.message({
          content: `操作成功，新增 ${insertRecords.length} 条，更新 ${updateRecords.length} 条，删除 ${removeRecords.length} 条`,
          status: "success",
        });
      } catch (e) {
        if (e && e.message) {
          VXETable.modal.message({ content: e.message, status: "error" });
        }
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.mytable-scrollbar {
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
  }
}

/** 默认模式 */
[data-vxe-ui-theme="light"] {
  .mytable-scrollbar {

    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background-color: #ffffff;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #bfbfbf;
    }

    ::-webkit-scrollbar-thumb:hover,
    ::-webkit-scrollbar-thumb:active {
      background-color: #787878;
    }
  }
}

/** 暗黑模式 */
[data-vxe-ui-theme="dark"] {
  .mytable-scrollbar {

    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background-color: #151518;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #bfbfbf;
    }

    ::-webkit-scrollbar-thumb:hover,
    ::-webkit-scrollbar-thumb:active {
      background-color: #a3a6ad;
    }
  }
}
</style>