import { instance } from "./axios";
import type { Client, CurrencyCode } from "@/types";

export interface ClientInput {
  name: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  // Geo is sent as foreign-key ids (clients table has state_id/city_id/postcode_id).
  state?: number;
  city?: number;
  postcode?: number;
  country?: string;
  taxId?: string;
  currency: CurrencyCode | string;
  paymentTermsDays: number;
}

export const list = () =>
  instance.get<Client[]>("/clients").then((r) => r.data);

export const get = (id: string) =>
  instance.get<Client>(`/clients/${id}`).then((r) => r.data);

export const create = (payload: ClientInput) =>
  instance.post<Client>("/clients", payload).then((r) => r.data);

export const update = (id: string, payload: Partial<ClientInput>) =>
  instance
    .put<Client>(`/clients/${id}`, payload)
    .then((r) => r.data);

export const remove = (id: string) =>
  instance.delete<void>(`/clients/${id}`).then((r) => r.data);
