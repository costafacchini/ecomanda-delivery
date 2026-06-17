export interface ITemplateParam {
  format: string
}

export interface ITemplate {
  id: string
  name: string
  namespace: string
  licensee: string | null
  headerParams: ITemplateParam[]
  bodyParams: ITemplateParam[]
  footerParams: ITemplateParam[]
}

export interface ITemplateFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type ITemplateInput = Omit<ITemplate, 'id'>

export interface ITemplateImportValues {
  [key: string]: unknown
}
