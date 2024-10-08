<template>
  <div>
    <vxe-toolbar ref="xToolbar" :loading="loading">
      <template #buttons>
        <vxe-button size="mini" status="primary" @click="insertEvent">临时新增</vxe-button>
        <vxe-button size="mini" status="warning" @click="$refs.xTable.removeCheckboxRow()">临时删除</vxe-button>
        <vxe-button size="mini" status="danger" content="提交" @click="saveEvent"></vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-table border resizable show-footer :height="tableHeight" keep-source class="mytable-scrollbar" size="mini"
      ref="xTable" :loading="loading" :data="tableData" :edit-rules="validRules" :edit-config="{
        mode: 'row',
        showUpdateStatus: true,
        showInsertStatus: true,
      }">
      >
      <vxe-column type="checkbox" width="50"></vxe-column>
      <vxe-column field="cuttingCode" title="裁片编号" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.cuttingCode" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="cabinetNum" title="柜号" :visible="false">
        <template #edit="{ row }">
          <vxe-input v-model="row.cabinetNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="groupNum" title="产品编号" :visible="false">
        <template #edit="{ row }">
          <vxe-input v-model="row.groupNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="productName" title="产品名称" :visible="false">
        <template #edit="{ row }">
          <vxe-input v-model="row.productName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="cuttingDate" title="裁片日期" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.cuttingDate" type="date" placeholder="请选择日期" transfer></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="groupType" title="组别" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.groupType" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="punching" title="打孔" :edit-render="{}">
        <template #default="{ row }">
          <span>{{ formatSex(row.punching) }}</span>
        </template>
        <template #edit="{ row }">
          <vxe-select v-model="row.punching" type="text" :options="sexList" transfer clearable></vxe-select>
        </template>
      </vxe-column>
      <vxe-column field="volumensNum" title="卷数" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.volumensNum" type="number" placeholder="请输入数值"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="metersNum" title="米数" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.metersNum" type="number" placeholder="请输入数值"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="inspectCode" title="检验编码" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.inspectCode" type="text" placeholder="请输入"></vxe-input>
        </template>
        <!-- <template #default="{ row }">
          <span>{{ row.inspectCode }}</span>
        </template>
        <template #edit="{ row }">
          <v-selectpage :data="insCodeList" show-field="insCode" key-field="insCode" ref="xInsCode"
            v-model="row.inspectCode" :pagination="true" :tb-columns="showFields" title="列表" language="cn"
            placeholder="请输入" :result-format="resultFormat" class="form-control">
          </v-selectpage>
        </template> -->
      </vxe-column>
      <vxe-column field="cuttingNum" title="裁片数" :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.cuttingNum" type="number" placeholder="请输入数值"></vxe-input>
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
import { selectInsCodeList } from "@/api/purchase/fabricinspectbill";
import { selectPickplanbillList } from "@/api/purchase/pickingplanbill";
import { getToken } from "@/utils/auth";
import { mapState } from "vuex";
import VXETable from "vxe-table";
export default {
  name: "Cuttingarea",
  data() {
    return {
      queryParams: {},
      // 表格数据
      tableData: [],
      sexList: [{ label: "打孔", value: "0" }],
      insCodeList: [],
      showFields: [{ title: "检验编码", data: "insCode" }],
      validRules: {
        cuttingCode: [
          { required: true, message: "裁片编号不能为空！" }
        ],
      },
      tableHeight: 0,
    };
  },
  created() {
    this.loadList();
    this.getInsCodeList();
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
    async getInsCodeList() {
      selectInsCodeList(this.queryParams).then((response) => {
        this.insCodeList = response.rows;
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
    formatSex(value) {
      if (value === "0") {
        return "打孔";
      }
      return "";
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
    duplicates(arr) {
      // 过滤掉重复项后的原数据
      let notRepeating = new Set();
      // 存放重复出现过的数据
      let Repeat = new Set();
      // 遍历原数组
      arr.forEach((item) => {
        if (notRepeating.has(item)) {
          // 若notRepeating中已经含有该元素，则存到Repeat中
          Repeat.add(item);
        } else {
          notRepeating.add(item);
        }
      });
      return Array.from(Repeat); //判断数组长度是否大于0即可知道是否重复
    },
    async saveEvent() {
      const $table = this.$refs.xTable;
      const resultValue = $table.afterFullData;
      const planNum = this.$route.query.planNum;
      const flag = resultValue.every((element) => {
        if (element.cuttingNum > planNum * 600) {
          VXETable.modal.message({
            content: "裁片数不能大于计划数！裁片编号：" + element.cuttingCode,
            status: "error",
          });
          return false;
        } else if (element.cuttingNum < element.takeBackNum) {
          VXETable.modal.message({
            content: "收回片数不能大于裁片数！裁片编号：" + element.cuttingCode,
            status: "error",
          });
          return false;
        } else if (element.takeBackNum < element.outWarehoseNum) {
          VXETable.modal.message({
            content:
              "出库数量不能大于收回片数！裁片编号：" + element.cuttingCode,
            status: "error",
          });
          return false;
        } else {
          return true;
        }
      });
      if (!flag) {
        return;
      }
      const num = this.queryParams.groupNum;
      const codes = $table.afterFullData.map((item) => item.cuttingCode);
      const repeat = this.duplicates(codes);
      if (repeat.length > 0) {
        VXETable.modal.message({
          content: JSON.stringify(repeat) + "裁片编号重复！",
          status: "warning",
        });
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

<style lang="scss" scoped>
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
</style>