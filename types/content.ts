export interface ContentItem {
  fields: {
    id: string
    发布时间: number
    平台?: string[]
    标签?: string[]
    标题?: Array<{
      text: string
      type: string
    }>
    正文?: Array<{
      text: string
      type: string
    }>
    账号: {
      link: string
      text: string
      type: string
    }
    链接?: Array<{
      text?: string
      link?: string
      type: string
    }>
  }
  record_id: string
}
