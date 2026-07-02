import { instance } from "./axios";
import type { Payment, PaymentMethod } from "@/types";

export interface ManualPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod | string;
  reference?: string;
  paidAt?: string;
}

export interface RefundInput {
  amount?: number;
  reason?: string;
}

export const list = () =>
  instance.get<Payment[]>("/payments").then((r) => r.data);

export const recordManual = (payload: ManualPaymentInput) =>
  instance
    .post<Payment>("/payments", payload)
    .then((r) => r.data);

export const refund = (paymentId: string, payload: RefundInput = {}) =>
  instance
    .post<Payment>(`/payments/${paymentId}/refund`, payload)
    .then((r) => r.data);
