import request from '@/utils/request'
import {
  praseStrEmpty
} from "@/utils/jingxuan";

// 查询物料清单列表
export function list(query) {
  return request({
    url: '/purchase/inspectionbill/list',
    method: 'get',
    params: query
  })
}

// 查询物料清单详情
export function getInspectionbill(inspectionId) {
  return request({
    url: '/purchase/inspectionbill/' + praseStrEmpty(inspectionId),
    method: 'get'
  })
}


// 新增物料清单
export function addInspectionbill(data) {
  return request({
    url: '/purchase/inspectionbill/add',
    method: 'post',
    data: data
  })
}

// 修改增物料清单
export function updateInspectionbill(data) {
  return request({
    url: '/purchase/inspectionbill/edit',
    method: 'put',
    data: data
  })
}
// 删除物料清单
export function delInspectionbill(ids) {
  return request({
    url: '/purchase/inspectionbill/' + ids,
    method: 'delete'
  })
}

// 导出物料清单
export function exportInspectionbill(query) {
  return request({
    url: '/purchase/inspectionbill/export',
    method: 'get',
    params: query
  })
}
