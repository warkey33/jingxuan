import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectBottleinspectionList(query) {
  return request({
    url: '/purchase/infusionBottleInspection/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getBottlebinspection(bottleId) {
    return request({
      url: '/purchase/infusionBottleInspection/' + praseStrEmpty(bottleId),
      method: 'get'
    })
  }
  
// 新增
export function addBottlebinspection(data) {
    return request({
      url: '/purchase/infusionBottleInspection/add',
      method: 'post',
      data: data
    })
}

// 修改
export function updateBottlebinspection(data) {
    return request({
        url: '/purchase/infusionBottleInspection/edit',
        method: 'put',
        data: data
    })
}
// 删除
export function delBottlebinspection(ids) {
  return request({
    url: '/purchase/infusionBottleInspection/' + ids,
    method: 'delete'
  })
}