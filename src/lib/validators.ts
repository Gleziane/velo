import { z } from 'zod';

/**
 * Validação do formulário de checkout.
 * Telefone e CPF chegam mascarados pelo InputMask, por isso a validação
 * é feita apenas pelo tamanho da string formatada:
 * - Telefone: "(11) 98765-4321" -> mínimo de 14 caracteres
 * - CPF: "123.456.789-01" -> mínimo de 14 caracteres
 */
export const orderSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  surname: z.string().min(2, 'Lastname deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  cpf: z.string().min(14, 'Document inválido'),
  store: z.string().min(1, 'Selecione uma loja'),
  terms: z.boolean().refine((val) => val === true, 'Aceite os termos'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
