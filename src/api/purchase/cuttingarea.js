import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectCuttingAreaList(query) {
  return request({
    url: '/purchase/cuttingarea/list',
    method: 'get',
    params: query
  })
}

// 新增
export function addCuttingArea(data) {
  return request({
    url: '/purchase/pickingplanbill/add',
    method: 'post',
    data: data
  })
}