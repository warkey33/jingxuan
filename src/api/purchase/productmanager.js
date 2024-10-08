import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectProductList(query) {
  return request({
    url: '/purchase/productManager/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getProductManager(productId) {
    return request({
      url: '/purchase/productManager/' + praseStrEmpty(productId),
      method: 'get'
    })
  }
  

// 新增
export function addProductManager(data) {
    return request({
      url: '/purchase/productManager/add',
      method: 'post',
      data: data
    })
}
  
// 修改
export function updateProductManager(data) {
return request({
    url: '/purchase/productManager/edit',
    method: 'put',
    data: data
})
}
// 删除
export function delProductManager(ids) {
  return request({
    url: '/purchase/productManager/' + ids,
    method: 'delete'
  })
}