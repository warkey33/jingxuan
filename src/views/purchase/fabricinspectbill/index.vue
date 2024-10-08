<template>
  <div>
    <vxe-toolbar ref="xToolbar" :loading="loading">
      <template #buttons>
        <vxe-button size="mini" status="primary" @click="handleImport()">面料单导入</vxe-button>
        <vxe-button size="mini" status="warning" @click="handleExport()">面料单导出</vxe-button>
        <vxe-button size="mini" status="info" @click="insertEvent">临时新增</vxe-button>
        <vxe-button size="mini" status="warning" @click="$refs.xTable.removeCheckboxRow()">临时删除</vxe-button>
        <vxe-button size="mini" status="danger" content="提交" @click="saveEvent"></vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-form :data="formData" :model="queryParams" size="mini" ref="xForm">
      <vxe-form-item field="insCode" title="检验编码" :span="6">
        <vxe-input v-model="queryParams.insCode" type="text" placeholder="请输入"></vxe-input>
      </vxe-form-item>
      <vxe-form-item field="cabinetNum" title="柜号" :span="6">
        <vxe-input v-model="queryParams.cabinetNum" type="text" placeholder="请输入"></vxe-input>
      </vxe-form-item>
      <vxe-form-item field="quantity" title="数量" :span="6">
        <vxe-input v-model="queryParams.quantity" type="number" placeholder="请输入"></vxe-input>
      </vxe-form-item>
      <vxe-form-item :span="6">
        <vxe-button type="submit" status="primary" size="mini" @click="searchEvent" content="查询"></vxe-button>
        <vxe-button type="reset" size="mini" @click="resetEvent" content="重置"></vxe-button>
      </vxe-form-item>
    </vxe-form>
    <vxe-table border resizable show-footer :height="tableHeight" :scroll-x="{ enabled: true }"
      :scroll-y="{ enabled: true }" keep-source class="mytable-scrollbar" size="mini" ref="xTable" :loading="loading"
      :data="tableData" :edit-rules="validRules" :edit-config="{
        mode: 'row',
        showUpdateStatus: true,
        showInsertStatus: true,
      }">
      >
      <vxe-column type="checkbox" width="50"></vxe-column>
      <vxe-column field="insCode" title="检验编码" width='100' show-overflow :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.insCode" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="productName" title="产品名称" width='90' show-overflow :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.productName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="spec" title="规格" width='80' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.spec" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="factory" title="生产厂家" width='100' show-overflow :edit-render="{}">
        <template #default="{ row }">
          <span>{{ factoryFormatResult(row) }}</span>
        </template>
        <template #edit="{ row }">
          <v-selectpage :data="factoryList" show-field="dictLabel" key-field="dictValue" ref="xProduct"
            v-model="row.factory" :pagination="true" :tb-columns="showFields" title="列表" language="cn" placeholder="请输入"
            :result-format="resultFormat" class="form-control">
          </v-selectpage>
        </template>
      </vxe-column>
      <vxe-column field="unit" title="单位" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.unit" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="volumeNum" title="卷数" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.volumeNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="quantity" title="数量" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.quantity" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="storageTime" title="入库时间" width='90' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.storageTime" clearable type="date" transfer></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="gsm" title="克重（G）" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.gsm" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="fabricWidth" title="门幅（CM）" width='70' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.fabricWidth" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="gpm" title="米重（G）" width='60'>
        <template #default="{ row }">
          <span>{{ countGpm(row) }}</span>
        </template>
      </vxe-column>
      <vxe-column field="totalWeight" title="总重（KG）" width='70'>
        <template #default="{ row }">
          <span>{{ countTotalWeight(row) }}</span>
        </template>
      </vxe-column>
      <vxe-column field="readColorData" title="读色数据" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.readColorData"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="readColorResult" title="读色结果" width='60' :edit-render="{}">
        <template #default="{ row }">
          <span>{{ colorFormatResult(row) }}</span>
        </template>
        <template #edit="{ row }">
          <vxe-select v-model="row.readColorResult" clearable>
            <vxe-option v-for="item in resultList" :value="item.dictValue" :label="`${item.dictLabel}`"
              :key="item.dictValue"></vxe-option>
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column field="bottlesNum" title="吊瓶数量" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.bottlesNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="bottlesResult" title="吊瓶结果" width='60' :edit-render="{}">
        <template #default="{ row }">
          <span>{{ bottleFormatResult(row) }}</span>
        </template>
        <template #edit="{ row }">
          <vxe-select v-model="row.bottlesResult" clearable>
            <vxe-option v-for="item in resultList" :value="item.dictValue" :label="`${item.dictLabel}`"
              :key="item.dictValue"></vxe-option>
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column field="dispatchTime" title="出库时间" width='90' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.dispatchTime" clearable type="date" placeholder="请选择日期" transfer></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="cabinetNum" title="柜号" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.cabinetNum" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="meters" title="米数" width='60' :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.meters" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="remark" title="备注" width='100' show-overflow :edit-render="{}">
        <template #edit="{ row }">
          <vxe-input v-model="row.remark3" type="text"></vxe-input>
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
    <div>
      <vxe-pager :layouts="['Sizes', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total']"
        :current-page.sync="queryParams.pageNum" :page-size.sync="queryParams.pageSize" :total="total"
        @page-change="handlePageChange">
      </vxe-pager>
    </div>
    <div>
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
        <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" v-loading="upload.isUploading"
          :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false"
          :action="upload.url" drag>
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
  </div>
</template>

<script>
import { importTemplate, selectAllList, importFabricBill } from "@/api/purchase/fabricinspectbill";
import { getToken } from "@/utils/auth";
import VXETable from "vxe-table";
export default {
  name: "Inspectarea",
  data() {
    return {
      // 表格数据
      tableData: [],
      resultList: [],
      tableHeight: 0,
      validRules: {
        readColorData: [{ pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/, message: '必须是数字且>=0' }],
        bottlesNum: [{ pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/, message: '必须是数字且>=0' }],
        meters: [{ pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/, message: '必须是数字且>=0' }],
        gsm: [{ pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/, message: '必须是数字且>=0' }],
        gpm: [{ pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/, message: '必须是数字且>=0' }],
        totalWeight: [{ pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/, message: '必须是数字且>=0' }],
      },
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        quantity: null,
        cabinetNum: '',
        insCode: ''
      },
      formData: {},
      factoryList: [],
      showFields: [{ title: "生产厂家", data: "dictLabel" }],
      // 导入参数
      upload: {
        // 是否显示弹出层（导入）
        open: false,
        // 弹出层标题（导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/purchase/fabricInspectBill/importData",
      },
    };
  },
  created() {
    this.getDicts("supplier_company").then(response => {
      this.factoryList = response.data;
    });
    this.getDicts("is_passed").then((response) => {
      this.resultList = response.data;
    });
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
      selectAllList(this.queryParams).then((response) => {
        this.tableData = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handlePageChange() {
      this.loadList()
    },
    factoryFormatResult(row) {
      return this.selectDictLabel(this.factoryList, row.factory);
    },
    colorFormatResult(row) {
      return this.selectDictLabel(this.resultList, row.readColorResult);
    },
    bottleFormatResult(row) {
      return this.selectDictLabel(this.resultList, row.bottlesResult);
    },
    countGpm(row) {
      return Math.round(row.gsm * row.fabricWidth * 100) / 100;
    },
    countTotalWeight(row) {
      return Math.round((row.gsm * row.fabricWidth * row.quantity / 1000) * 100) / 100;
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "导入";
      this.upload.open = true;
    },
    handleExport() {
      importFabricBill(this.queryParams).then((response) => {
        this.download(response.msg);
      });
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
      this.loadList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
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
      const codes = $table.afterFullData.map((item) => item.insCode);
      const repeat = this.duplicates(codes);
      if (repeat.length > 0) {
        VXETable.modal.message({
          content: JSON.stringify(repeat) + "检验编码重复！",
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
          `${process.env.VUE_APP_BASE_API}/purchase/fabricInspectBill/add`,
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
    searchEvent() {
      this.queryParams.pageNum = 1;
      this.loadList()
    },
    resetEvent() {
      this.queryParams = { pageNum: 1, pageSize: 10, quantity: null, factory: null, insCode: null }
      this.$refs.xForm.reset();
      this.loadList()
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
      background-color: #FFFFFF;
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
      background-color: #A3A6AD;
    }
  }
}
</style>
