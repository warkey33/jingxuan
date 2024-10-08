import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectPickingbillList(query) {
  return request({
    url: '/purchase/pickingbill/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getPickingbill(pickingId) {
    return request({
      url: '/purchase/pickingbill/' + praseStrEmpty(pickingId),
      method: 'get'
    })
  }
  

// 新增
export function addPickingbill(data) {
    return request({
      url: '/purchase/pickingbill/add',
      method: 'post',
      data: data
    })
}
  
// 修改
export function updatePickingbill(data) {
return request({
    url: '/purchase/pickingbill/edit',
    method: 'put',
    data: data
})
}
// 删除
export function delPickingbill(ids) {
  return request({
    url: '/purchase/pickingbill/' + ids,
    method: 'delete'
  })
}

// 导出
export function exportPickingbill(query) {
  return request({
    url: '/purchase/pickingbill/export',
    method: 'get',
    params: query
  })
}

// 导出统计领料
export function exportPickingStatistics(cabinetNum) {
  return request({
    url: '/purchase/pickingbill/export/statistic/' + cabinetNum,
    method: 'get',
    responseType: 'blob'
  })
}

// 统计投料详情
export function feedingStatistics(cabinetNum) {
  return request({
    url: '/purchase/pickingbill/feed/statistic/' + cabinetNum,
    method: 'get'
  })
}

// 查询单据编号
export function selectBillcodeList(query) {
  return request({
    url: '/purchase/pickingbill/billcode',
    method: 'get',
    params: query
  })
}

// 删除单据编号
export function delBillCodeList(data) {
  return request({
    url: '/purchase/pickingbill/delbillcode',
    method: 'post',
    data: data
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/pickingbill/importTemplate',
    method: 'get'
  })
}

// 查询未完成投料的柜号
export function selectUnfinishedPick(query) {
  return request({
    url: '/purchase/pickingbill/feed/unfinished',
    method: 'get',
    params: query
  })
}