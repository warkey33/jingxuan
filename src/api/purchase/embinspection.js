import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectEmbinspectionList(query) {
  return request({
    url: '/purchase/embinspection/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getEmbinspection(embinspectId) {
    return request({
      url: '/purchase/embinspection/' + praseStrEmpty(embinspectId),
      method: 'get'
    })
  }
  
// 新增
export function addEmbinspection(data) {
    return request({
      url: '/purchase/embinspection/add',
      method: 'post',
      data: data
    })
}

// 修改
export function updateEmbinspection(data) {
    return request({
        url: '/purchase/embinspection/edit',
        method: 'put',
        data: data
    })
}
// 删除
export function delEmbinspection(ids) {
  return request({
    url: '/purchase/embinspection/' + ids,
    method: 'delete'
  })
}