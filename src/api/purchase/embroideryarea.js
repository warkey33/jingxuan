import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectEmbrAreaList(query) {
  return request({
    url: '/purchase/embroideryarea/list',
    method: 'get',
    params: query
  })
}

// 新增
export function addEmbrArea(data) {
  return request({
    url: '/purchase/embroideryarea/add',
    method: 'post',
    data: data
  })
}