import { readFileSync } from 'fs'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

import { ColumnType, Generated, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'
type OrderColor = 'lunar-white' | 'midnight-black' | 'glacier-blue'
type WheelType = 'aero' | 'sport'
type PaymentMethod = 'avista' | 'financiamento'

export type SeedOrderInput = {
  number: string
  status: OrderStatus
  color: OrderColor
  wheelType: WheelType
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerCpf?: string
  paymentMethod: PaymentMethod
  totalPrice: number
  createdAt?: Date
  updatedAt?: Date
}

type OrdersTable = {
  id: Generated<string>
  order_number: string
  color: string
  wheel_type: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: string
  total_price: number
  status: string
  created_at: Date
  updated_at: Date
  optionals: ColumnType<string[] | null, string[] | null | undefined, string[] | null>
}

type Database = {
  orders: OrdersTable
}

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const envPath = resolve(process.cwd(), '.env')
  const envFile = readFileSync(envPath, 'utf8')
  const databaseLine = envFile.split(/\r?\n/).find((line) => line.trim().startsWith('DATABASE_URL='))

  return databaseLine?.slice(databaseLine.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '')
}

const databaseUrl = loadDatabaseUrl()

if (!databaseUrl) {
  throw new Error('DATABASE_URL não foi configurada para os testes de integração.')
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

const database = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})

export async function upsertOrder(order: SeedOrderInput) {
  const normalizedNumber = order.number.trim().toUpperCase()
  const createdAt = order.createdAt ?? new Date()
  const updatedAt = order.updatedAt ?? createdAt

  try {
    await database
      .insertInto('orders')
      .values({
        id: randomUUID(),
        order_number: normalizedNumber,
        color: order.color,
        wheel_type: order.wheelType,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone ?? '(11) 99999-9999',
        customer_cpf: order.customerCpf ?? '000.000.000-00',
        payment_method: order.paymentMethod,
        total_price: order.totalPrice,
        status: order.status,
        created_at: createdAt,
        updated_at: updatedAt,
        optionals: undefined,
      })
      .onConflict((conflict) =>
        conflict.column('order_number').doUpdateSet({
          color: order.color,
          wheel_type: order.wheelType,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          payment_method: order.paymentMethod,
          total_price: order.totalPrice,
          status: order.status,
          updated_at: updatedAt,
        })
      )
      .execute()

    return order
  } catch (error) {
    console.error('Erro ao fazer upsert de pedido:', error)
    throw error
  }
}

export async function deleteOrderByNumber(orderNumber: string) {
  try {
    await database
      .deleteFrom('orders')
      .where('order_number', '=', orderNumber.trim().toUpperCase())
      .execute()
  } catch (error) {
    console.error('Erro ao deletar pedido:', error)
    throw error
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    return await database
      .selectFrom('orders')
      .selectAll()
      .where('order_number', '=', orderNumber.trim().toUpperCase())
      .executeTakeFirst()
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    throw error
  }
}

export async function closeOrdersDatabase() {
  try {
    await database.destroy()
  } catch (error) {
    console.error('Erro ao fechar conexão com banco:', error)
  }
}
export async function deleteOrderByEmail(customerEmail: string) {
  try {
    await database
      .deleteFrom('orders')
      .where('customer_email', '=', customerEmail)
      .execute()
  } catch (error) {
    console.error('Erro ao deletar pedido por email:', error)
    throw error
  }
}