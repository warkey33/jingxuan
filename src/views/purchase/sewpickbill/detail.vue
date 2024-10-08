<template>
  <div>
    <vxe-toolbar ref="xToolbar" :loading="loading">
      <template #buttons>
        <!-- <vxe-button size="mini" status="primary" @click="insertEvent">临时新增</vxe-button
        >
        <vxe-button size="mini" status="warning" @click="$refs.xTable.removeCheckboxRow()" >临时删除</vxe-button
        > -->
        <vxe-button size="small" status="danger" content="确认提交" @click="saveEvent"></vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-table border resizable show-footer keep-source class="mytable-scrollbar" size="mini" ref="xTable" :height="tableHeight"
      align="center" :loading="loading" :data="tableData" :edit-rules="validRules" :edit-config="{
        mode: 'row',
        showUpdateStatus: true,
        showInsertStatus: true,
      }">
      <vxe-column field="sewId" :visible="false"></vxe-column>
      <vxe-column field="productName" title="产品名称">
        <template #edit="{ row }">
          <vxe-input v-model="row.productName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="materialCode" title="物料编码">
        <template #edit="{ row }">
          <vxe-input v-model="row.materialCode" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="materialName" title="物料名称">
        <template #edit="{ row }">
          <vxe-input v-model="row.materialName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="specification" title="规格">
        <template #edit="{ row }">
          <vxe-input v-model="row.specification" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="unit" title="单位">
        <template #edit="{ row }">
          <vxe-input v-model="row.unit" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="cuttingCode" title="批次号" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.cuttingCode" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="takeBackNum" title="数量" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.takeBackNum" type="number"></vxe-input>
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
import { getToken } from "@/utils/auth";
import { selectSewpickDetailList } from "@/api/purchase/sewpickbill";
export default {
  name: "sewpickbilldetail",
  data() {
    return {
      queryParams: {},
      tableHeight: 0,
      // 表格数据
      tableData: [],
      validRules: {

      },
    };
  },
  created() {
    this.loadList();
  },
  mounted() {
    this.$nextTick(() => {
      //后面的50：根据需求空出的高度，自行调整
      this.tableHeight = window.innerHeight - 100;
      const $table = this.$refs;
    })
  },
  methods: {
    /** 查询列表 */
    async loadList() {
      this.loading = true;
      const sewId = this.$route.query.sewId;
      this.queryParams.sewId = sewId;
      this.queryParams.productName = this.$route.query.productName;
      selectSewpickDetailList(this.queryParams).then((response) => {
        this.tableData = response.rows;
        this.tableData.forEach((item, index) => {
          if (item.sewId == null) {
            item.sewId = sewId;
          }
        });
        this.total = response.total;
        this.loading = false;
      });
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
    clickDate() { },
    async insertEvent() {
      const $table = this.$refs.xTable;
      const { row: newRow } = await $table.insert();
      // 插入一条数据并触发校验
      newRow.sewId = this.queryParams.sewId;
      newRow.productName = this.queryParams.productName;
      const errMap = await $table.validate(newRow).catch((errMap) => errMap);
      if (errMap) {
        // 校验不通过
      }
    },
    async saveEvent() {
      const $table = this.$refs.xTable;
      const { insertRecords, removeRecords, updateRecords } = $table.getRecordset();
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
        const body = $table.afterFullData;
        await fetch(
          `${process.env.VUE_APP_BASE_API}/purchase/sewPickBillDetail/add`,
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
        console.log(e)
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