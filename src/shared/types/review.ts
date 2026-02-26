import { z } from 'zod';

export const reviewPayloadSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  date: z.string().min(1),
  menu: z.string().min(1),
  companion: z.string().min(1),
  pros: z.string().optional(),
  cons: z.string().optional(),
  extra: z.string().optional(),
  user_draft: z.string().optional(),
});

export type ReviewPayload = z.infer<typeof reviewPayloadSchema>;

export type RestaurantPayload = ReviewPayload;

export type ReviewEditPayload = {
  review: string;
  request: string;
};

export type BookPayload = {
  title: string;
  author: string;
  readDate?: string;
  genre?: string;
  pros?: string;
  extra?: string;
};
