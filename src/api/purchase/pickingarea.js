import request from '@/utils/request'
import {
  praseStrEmpty
} from "@/utils/jingxuan";

// 查询列表
export function selectPickingAreaList(query) {
  return request({
    url: '/purchase/pickingarea/list',
    method: 'get',
    params: query
  })
}

// 新增
export function addPickingArea(data) {
  return request({
    url: '/purchase/pickingarea/add',
    method: 'post',
    data: data
  })
}
