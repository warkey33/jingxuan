import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询物料清单列表
export function selectMaterialList(query) {
  return request({
    url: '/purchase/materialbill/list',
    method: 'get',
    params: query
  })
}

// 查询物料清单详情
export function getMaterialbill(materialId) {
    return request({
      url: '/purchase/materialbill/' + praseStrEmpty(materialId),
      method: 'get'
    })
  }
  

// 新增物料清单
export function addMaterialbill(data) {
    return request({
      url: '/purchase/materialbill/add',
      method: 'post',
      data: data
    })
}
  
// 修改增物料清单
export function updateMaterialbill(data) {
return request({
    url: '/purchase/materialbill/edit',
    method: 'put',
    data: data
})
}
// 删除物料清单
export function delMaterialbill(ids) {
  return request({
    url: '/purchase/materialbill/' + ids,
    method: 'delete'
  })
}

// 导出物料清单
export function exportMaterialbill(query) {
  return request({
    url: '/purchase/materialbill/export',
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/materialbill/importTemplate',
    method: 'get'
  })
}