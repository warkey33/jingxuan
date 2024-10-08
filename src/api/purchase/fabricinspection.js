import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectAllList(query) {
  return request({
    url: '/purchase/fabricInspection/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getInfo(fabricId) {
    return request({
      url: '/purchase/fabricInspection/' + praseStrEmpty(fabricId),
      method: 'get'
    })
  }
  
// 新增
export function add(data) {
    return request({
      url: '/purchase/fabricInspection/add',
      method: 'post',
      data: data
    })
}

// 修改
export function update(data) {
    return request({
        url: '/purchase/fabricInspection/edit',
        method: 'put',
        data: data
    })
}
// 删除
export function del(ids) {
  return request({
    url: '/purchase/fabricInspection/' + ids,
    method: 'delete'
  })
}