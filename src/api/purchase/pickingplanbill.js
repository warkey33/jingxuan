import request from '@/utils/request'

// 查询列表
export function selectPickingplanbillList(query) {
  return request({
    url: '/purchase/cuttingEmbroideryPicking/list',
    method: 'get',
    params: query
  })
}

// 查询详情列表
export function selectPickplanbillList(query) {
  return request({
    url: '/purchase/pickingplanbill/list',
    method: 'get',
    params: query
  })
}

export function selectCuttingcodeList(query) {
  return request({
    url: '/purchase/pickingplanbill/cuttingcode/list',
    method: 'get',
    params: query
  })
}

export function selectCabinetList(query) {
  return request({
    url: '/purchase/pickingplanbill/cabinet/list',
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/pickingplanbill/importTemplate',
    method: 'get'
  })
}

// 导出
export function exportPickingplanbill(data) {
  return request({
    url: '/purchase/pickingplanbill/export',
    method: 'post',
    data: data
  })
}

// 导出
export function exportCutEmbrbill(data) {
  return request({
    url: '/purchase/pickingplanbill/exportBill',
    method: 'post',
    data: data
  })
}