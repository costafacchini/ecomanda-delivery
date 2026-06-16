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
