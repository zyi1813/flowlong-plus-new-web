import { request } from '../../request';

/** 查询文件信息 */
export function fileInfo(id: string | number) {
  return request({
    url: '/api/oss/fileInfo',
    method: 'get',
    params: { id }
  });
}
