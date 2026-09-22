import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(1)
})

export const transactionSchema = z.object({
    amount: z.int(),
    desc: z.string().min(1),
    date: z.string(),
    category_id: z.int()
})
