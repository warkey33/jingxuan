import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询物料清单列表
export function list(query) {
  return request({
    url: '/purchase/purchasebill/list',
    method: 'get',
    params: query
  })
}

// 查询物料清单详情
export function getPurchasebill(purchaseId) {
    return request({
      url: '/purchase/purchasebill/' + praseStrEmpty(purchaseId),
      method: 'get'
    })
  }
  

// 新增物料清单
export function addPurchasebill(data) {
    return request({
      url: '/purchase/purchasebill/add',
      method: 'post',
      data: data
    })
}
  
// 修改增物料清单
export function updatePurchasebill(data) {
return request({
    url: '/purchase/purchasebill/edit',
    method: 'put',
    data: data
})
}
// 删除物料清单
export function delPurchasebill(ids) {
  return request({
    url: '/purchase/purchasebill/' + ids,
    method: 'delete'
  })
}

// 导出物料清单
export function exportPurchasebill(query) {
  return request({
    url: '/purchase/purchasebill/export',
    method: 'get',
    params: query
  })
}