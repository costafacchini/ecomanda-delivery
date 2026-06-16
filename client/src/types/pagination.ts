/**
 * The API returns paginated results as a plain array.
 * Callers detect the last page by checking isEmpty(records).
 * This alias documents that a given response field is a page of T items.
 */
export type IPage<T> = T[]
