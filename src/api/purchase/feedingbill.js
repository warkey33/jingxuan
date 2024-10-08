import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectFeedingbillList(query) {
  return request({
    url: '/purchase/feedingbill/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getFeedingbill(feedingId) {
    return request({
      url: '/purchase/feedingbill/' + praseStrEmpty(feedingId),
      method: 'get'
    })
  }
  

// 新增
export function addFeedingbill(data) {
    return request({
      url: '/purchase/feedingbill/add',
      method: 'post',
      data: data
    })
}
  
// 修改
export function updateFeedingbill(data) {
return request({
    url: '/purchase/feedingbill/edit',
    method: 'put',
    data: data
})
}
// 删除
export function delFeedingbill(ids) {
  return request({
    url: '/purchase/feedingbill/' + ids,
    method: 'delete'
  })
}

// 导出
export function exportFeedingbill(query) {
  return request({
    url: '/purchase/feedingbill/export',
    method: 'get',
    params: query
  })
}