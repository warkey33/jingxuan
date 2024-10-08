import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询物料清单列表
export function list(query) {
  return request({
    url: '/purchase/warehousebill/list',
    method: 'get',
    params: query
  })
}

// 查询物料清单详情
export function getWarehousebill(materialId) {
    return request({
      url: '/purchase/warehousebill/' + praseStrEmpty(materialId),
      method: 'get'
    })
  }
  

// 新增物料清单
export function addWarehousebill(data) {
    return request({
      url: '/purchase/warehousebill/add',
      method: 'post',
      data: data
    })
}
  
// 修改增物料清单
export function updateWarehousebill(data) {
return request({
    url: '/purchase/warehousebill/edit',
    method: 'put',
    data: data
})
}
// 删除物料清单
export function delWarehousebill(ids) {
  return request({
    url: '/purchase/warehousebill/' + ids,
    method: 'delete'
  })
}

// 导出物料清单
export function exportWarehousebill(query) {
  return request({
    url: '/purchase/warehousebill/export',
    method: 'get',
    params: query
  })
}