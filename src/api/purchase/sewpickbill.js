import request from '@/utils/request'
import {
  praseStrEmpty
} from "@/utils/jingxuan";

// 查询列表
export function selectSewPickBillList(query) {
  return request({
    url: '/purchase/sewpickbill/list',
    method: 'get',
    params: query
  })
}

// 查询可领用的裁片编号
export function selectCuttingCodeList(data) {
  return request({
    url: '/purchase/sewpickbill/cuttinglist',
    method: 'post',
    data: data
  })
}

// 查询详情
export function getSewPickBill(sewId) {
  return request({
    url: '/purchase/sewpickbill/' + praseStrEmpty(sewId),
    method: 'get'
  })
}

// 新增
export function addSewPickBill(data) {
  return request({
    url: '/purchase/sewpickbill/add',
    method: 'post',
    data: data
  })
}

// 修改
export function updateSewPickBill(data) {
  return request({
    url: '/purchase/sewpickbill/edit',
    method: 'put',
    data: data
  })
}

// 删除
export function delSewPickBill(ids) {
  return request({
    url: '/purchase/sewpickbill/' + ids,
    method: 'delete'
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/sewpickbill/importTemplate',
    method: 'get'
  })
}

// 导出秀花单
export function exportSewBill(data) {
  return request({
    url: '/purchase/sewpickbill/export',
    method: 'post',
    data: data
  })
}

// 导出裁片入库单
export function cuttingentrybill(query) {
  return request({
    url: '/purchase/sewpickbill/exportcutting',
    method: 'get',
    params: query
  })
}

export function selectSewpickDetailList(data) {
  return request({
    url: '/purchase/sewpickbill/detailist',
    method: 'post',
    data: data
  })
}
