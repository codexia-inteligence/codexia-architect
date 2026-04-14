export type Nicho = 'campo' | 'clinica' | 'asesoria' | 'otro'

export interface FormData {
  empresa: string
  contacto: string
  nicho: Nicho | ''
  problemas: string[]
  contexto: string
  herramientas: string
  perdidaMensual: number | null
  sedes: number
}

export interface ModuloPropuesto {
  name: string
  description: string
  who_uses: string
  is_custom: boolean
  base_module_id: string | null
  hours: number
}

export interface AgentePropuesto {
  name: string
  description: string
  capabilities_used: string[]
  hours: number
}

export interface Fase {
  name: string
  weeks: string
  deliverables: string
}

export interface ROI {
  monthly_savings: number
  payback_month: number
  year_return: number
}

export interface Opcion {
  name: string
  summary: string
  modules: ModuloPropuesto[]
  agents: AgentePropuesto[]
  integrations: string[]
  phases: Fase[]
  total_hours: number
  price_range: string
  timeline: string
  roi: ROI | null
}

export interface Propuesta {
  pain_statement: string
  option_a: Opcion
  option_b: Opcion
}
