export interface ITemplate {
  id: string
  _id: string
  name: string
  namespace: string
  licensee?: string
}

export interface ITemplateFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type ITemplateInput = Omit<ITemplate, 'id' | '_id'>

export interface ITemplateImportValues {
  [key: string]: unknown
}
