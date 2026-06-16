/** Generic paginated response wrapper.
 * Some endpoints return a plain array; others return { data, total }.
 * This covers the object form — use T[] directly for array-form endpoints.
 */
export interface IPaginatedResponse<T> {
  data: T[]
  total: number
}

/** Common filter params shared by list endpoints */
export interface IBaseFilters {
  page?: number
  expression?: string
  licensee?: string
}
