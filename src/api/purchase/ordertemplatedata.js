import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/jingxuan";

// 查询列表
export function selectOrderTemplateDataList(query) {
  return request({
    url: '/purchase/ordertemplatedata/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getOrderTemplateData(templateId) {
    return request({
      url: '/purchase/ordertemplatedata/' + praseStrEmpty(templateId),
      method: 'get'
    })
  }


// 新增
export function addOrderTemplateData(data) {
    return request({
      url: '/purchase/ordertemplatedata/add',
      method: 'post',
      data: data
    })
}

// 修改
export function updateOrderTemplateData(data) {
return request({
    url: '/purchase/ordertemplatedata/edit',
    method: 'put',
    data: data
})
}
// 删除
export function delOrderTemplateData(ids) {
  return request({
    url: '/purchase/ordertemplatedata/' + ids,
    method: 'delete'
  })
}

// 导出订单模板数据
export function exportOrderTemplateData(query) {
  return request({
    url: '/purchase/ordertemplatedata/export',
    method: 'get',
    params: query
  })
}


// 导出模板
export function exportTemplate(query) {
  return request({
    url: '/purchase/ordertemplatedata/importTemplate',
    method: 'get',
    params: query
  })
}

 // 导出工单模板
export function exportWorkOrderTemplateData(ids) {
    return request({
      url: '/purchase/ordertemplatedata/workordertemplatedata/' + ids,
      method: 'get'
    })
}


