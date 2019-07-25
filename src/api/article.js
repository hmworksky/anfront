import request from '@/utils/request'
import qs from 'qs'

export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}

export function gameInfoList(query) {
  return request({
    url: '/auto/game/',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: query
  })
}

export function deleteGame(id) {
  return request({
    url: '/auto/game/' + id,
    method: 'delete'
  })
}

// 新增或更新游戏
export function createGame(data) {
  return request({
    url: '/auto/game/',
    method: 'post',
    data
  })
}

export function updateGame(id, data) {
  console.log('###222', id, data)
  return request({
    url: '/auto/game/' + id + '/',
    method: 'put',
    data
  })
}

export function getInterfaceInfoList(query) {
  return request({
    url: '/auto/interface/info/',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: query
  })
}

export function deleteInterfaceInfo(id) {
  return request({
    url: '/auto/interface/info/' + id,
    method: 'delete'
  })
}

// 新增或更新游戏
export function createInterfaceInfo(data) {
  console.error('###111', data)
  return request({
    url: '/auto/interface/info/',
    method: 'post',
    data
  })
}

export function updateInterfaceInfo(id, data) {
  console.error('###444', id, data)
  return request({
    url: '/auto/interface/info/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteMockInfo(id) {
  return request({
    url: '/auto/mock/' + id,
    method: 'delete'
  })
}

// 新增或更新游戏
export function createMockInfo(data) {
  console.error('###111', data)
  return request({
    url: '/auto/mock/',
    method: 'post',
    data
  })
}

export function updateMockInfo(id, data) {
  console.error('###444', id, data)
  return request({
    url: '/auto/mock/' + id + '/',
    method: 'put',
    data
  })
}

export function getMockList(query) {
  return request({
    url: '/auto/mock/',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: query
  })
}
