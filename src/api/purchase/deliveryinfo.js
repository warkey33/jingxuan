import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询交货信息列表
export function selectDeliveryInfoList(query) {
  return request({
    url: '/purchase/deliveryinfo/list',
    method: 'get',
    params: query
  })
}

// 查询交货信息详情
export function getDeliveryInfo(templateId) {
    return request({
      url: '/purchase/deliveryinfo/' + praseStrEmpty(templateId),
      method: 'get'
    })
}

// 新增交货信息
export function addDeliveryInfo(data) {
    return request({
      url: '/purchase/deliveryinfo/add',
      method: 'post',
      data: data
    })
}

// 修改增交货信息
export function updateDeliveryInfo(data) {
return request({
    url: '/purchase/deliveryinfo/edit',
    method: 'put',
    data: data
})
}
// 删除交货信息
export function delDeliveryInfo(ids) {
  return request({
    url: '/purchase/deliveryinfo/' + ids,
    method: 'delete'
  })
}

// 导出订单清单
export function exportDeliveryInfo(query) {
  return request({
    url: '/purchase/deliveryinfo/export',
    method: 'get',
    params: query
  })
}

 // 生成交货模板
 export function exportDeliveryInfoWordDoc(ids) {
  return request({
    url: '/purchase/deliveryinfo/exportWordDoc/' + ids,
    method: 'get'
  })
}


