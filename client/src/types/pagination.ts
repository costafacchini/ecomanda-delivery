/**
 * The API returns paginated results as a plain array.
 * Callers detect the last page by checking isEmpty(records).
 * This alias documents that a given response field is a page of T items.
 */
export type IPage<T> = T[]

/** Generic paginated response for endpoints that return { data, total }. */
export interface IPaginatedResponse<T> {
  data: T[]
  total: number
}

export interface IBaseFilters {
  page?: number
  expression?: string
  licensee?: string
}
