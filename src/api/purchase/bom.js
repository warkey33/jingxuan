import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectBomList(query) {
  return request({
    url: '/purchase/bom/list',
    method: 'get',
    params: query
  })
}

// 查询产品列表
export function selectProductName(query) {
  return request({
    url: '/purchase/bom/productname',
    method: 'get',
    params: query
  })
}

// 查询产品列表
export function selectProducts(query) {
  return request({
    url: '/purchase/bom/products',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getBom(bomId) {
    return request({
      url: '/purchase/bom/' + praseStrEmpty(bomId),
      method: 'get'
    })
  }
  
// 新增
export function addBom(data) {
    return request({
      url: '/purchase/bom/add',
      method: 'post',
      data: data
    })
}

// 修改
export function updateBom(data) {
    return request({
        url: '/purchase/bom/edit',
        method: 'put',
        data: data
    })
}
// 删除
export function delBom(ids) {
  return request({
    url: '/purchase/bom/' + ids,
    method: 'delete'
  })
}

// 通过产品名称删除
export function delBomByNames(productNames) {
  return request({
    url: '/purchase/bom/removebynames/' + productNames,
    method: 'delete'
  })
}

// 导出
export function exportBom(query) {
  return request({
    url: '/purchase/bom/export',
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/purchase/bom/importTemplate',
    method: 'get'
  })
}