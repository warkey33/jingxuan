import request from '@/utils/request'

// 查询列表
export function selectAllList(query) {
  return request({
    url: '/purchase/fabricInspectBill/list',
    method: 'get',
    params: query
  })
}

// 查询列表 
export function selectProductList(query) {
  return request({
    url: '/purchase/fabricInspectBill/product/list',
    method: 'get',
    params: query
  })
}

export function selectInsCodeList(query) {
  return request({
    url: '/purchase/fabricInspectBill/fabricins/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getDetailInfo(fabricId) {
  return request({
    url: '/purchase/fabricInspectBill/' + praseStrEmpty(fabricId),
    method: 'get'
  })
}

// 查询详情
export function getDetailInfoByInsCode(insCode) {
  return request({
    url: '/purchase/fabricInspectBill/code/' + insCode,
    method: 'get'
  })
}

// 新增
export function add(data) {
  return request({
    url: '/purchase/fabricInspectBill/add',
    method: 'post',
    data: data
  })
}

// 修改
export function update(data) {
  return request({
    url: '/purchase/fabricInspectBill/edit',
    method: 'put',
    data: data
  })
}
// 删除
export function remove(ids) {
  return request({
    url: '/purchase/fabricInspectBill/' + ids,
    method: 'delete'
  })
}

// 面料记录单导出
export function importFabricBill(query) {
  return request({
    url: '/purchase/fabricInspectBill/export',
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/fabricInspectBill/importTemplate',
    method: 'get'
  })
}