import { readFileSync } from 'fs'
import { resolve } from 'path'

import { createClient } from '@supabase/supabase-js'

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env')
  const raw = readFileSync(envPath, 'utf8')
  const env: Record<string, string> = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

    env[key] = value
  }

  return env
}

const env = loadEnvFile()
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const randomSuffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const uniqueSuffix = `${Date.now().toString(36).slice(-3).toUpperCase()}${randomSuffix}`

  return `VLO-${uniqueSuffix}`.slice(0, 12).toUpperCase()
}

export async function seedOrder(data: {
  number: string
  status: 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'
  color: 'lunar-white' | 'midnight-black' | 'glacier-blue'
  wheelType: 'aero' | 'sport'
  customerName: string
  customerEmail: string
  paymentMethod: 'avista' | 'financiamento'
  totalPrice: number
}) {
  const normalizedNumber = data.number.trim().toUpperCase()

  const { error } = await supabase.from('orders').upsert(
    {
      order_number: normalizedNumber,
      color: data.color,
      wheel_type: data.wheelType,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '000.000.000-00',
      payment_method: data.paymentMethod,
      total_price: data.totalPrice,
      status: data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'order_number' }
  )

  if (error) {
    throw new Error(`Erro ao criar pedido de teste: ${error.message}`)
  }

  return data
}
