
interface _ComponentType {
    id: string
    title: string
    component: any
    level?: number
    parentTitle?: string
    parentId?: string
}

export interface Doc {
    id?: string
    label?: string
    component?: any
    doc?: Doc[]
    children?: Doc[]
}
