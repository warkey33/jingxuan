import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectPickplanbillList(query) {
  return request({
    url: '/purchase/pickplanbill/list',
    method: 'get',
    params: query
  })
}

// 查询可领用的裁片编号
export function selectCuttingCodeList(query) {
  return request({
    url: '/purchase/pickplanbill/cuttinglist',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getPickplanbill(pcikPlanId) {
  return request({
    url: '/purchase/pickplanbill/' + praseStrEmpty(pcikPlanId),
    method: 'get'
  })
}

// 新增
export function addPickplanbill(data) {
  return request({
    url: '/purchase/pickplanbill/add',
    method: 'post',
    data: data
  })
}

// 修改
export function updatePickplanbill(data) {
  return request({
    url: '/purchase/pickplanbill/edit',
    method: 'put',
    data: data
  })
}

// 删除
export function delPickplanbill(ids) {
  return request({
    url: '/purchase/pickplanbill/' + ids,
    method: 'delete'
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/pickingplanbill/importTemplate',
    method: 'get'
  })
}

// 导出秀花单
export function exportEmbroiderBill(ids) {
  return request({
    url: '/purchase/pickplanbill/exportembroider/' + ids,
    method: 'get',
    params: ids
  })
}

//导出绣花入库单
export function exportentrybill(query) {
  return request({
    url: '/purchase/pickplanbill/exportentrybill',
    method: 'get',
    params: query
  })
}
