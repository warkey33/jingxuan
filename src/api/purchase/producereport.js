import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectProduceReportList(query) {
  return request({
    url: '/purchase/report/list',
    method: 'get',
    params: query
  })
}

// 查询详情列表
export function selectProduceReportDetailList(query) {
  return request({
    url: '/purchase/report/detaillist',
    method: 'get',
    params: query
  })
}

// 查询柜号列表
export function selectCabinetList(query) {
  return request({
    url: '/purchase/report/cabinet/list',
    method: 'get',
    params: query
  })
}

// 查询工序列表
export function selectProcessList(query) {
  return request({
    url: '/purchase/report/process/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getProduceReport(reportId) {
    return request({
      url: '/purchase/report/' + praseStrEmpty(reportId),
      method: 'get'
    })
}

// 新增
export function addProduceReport(data) {
    return request({
      url: '/purchase/report/add',
      method: 'post',
      data: data
    })
}

// 修改增
export function updateProduceReport(data) {
return request({
    url: '/purchase/report/edit',
    method: 'put',
    data: data
})
}
// 删除柜号编号
export function delProduceReport(ids) {
  return request({
    url: '/purchase/report/cabinet/' + ids,
    method: 'delete'
  })
}

// 删除报工Id
export function delReportId(ids) {
  return request({
    url: '/purchase/report/' + ids,
    method: 'delete'
  })
}

// 导出工人清单
export function exportProduceReport(query) {
  return request({
    url: '/purchase/report/export',
    method: 'get',
    params: query,
    responseType: 'blob' // 这个类型不加会打不开Excel文件
  })
}

 // 生成交货模板
 export function exportWorkOrder(query) {
  return request({
    url: '/purchase/report/exportWorkOrder',
    method: 'get',
    params: query
  })
}

// 工序数量统计
export function selectGXStatistics(query) {
  return request({
    url: '/purchase/report/gxStatistics',
    method: 'get',
    params: query
  })
}

// 工序数量统计导出
export function exportGXStatistics(query) {
  return request({
    url: '/purchase/report/gxStatisticsExport',
    method: 'get',
    params: query
  })
}

// 工序领料统计导出
export function exportGXPickingStatistics(query) {
  return request({
    url: '/purchase/report/picking/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/report/importTemplate',
    method: 'get'
  })
}