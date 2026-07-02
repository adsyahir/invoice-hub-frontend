import { instance } from "./axios";
import type { User, UserRole } from "@/types";

export interface InviteInput {
  email: string;
  role: UserRole | string;
}

export const list = () =>
  instance.get<User[]>("/teams").then((r) => r.data);

export const invite = (payload: InviteInput) =>
  instance.post<User>("/teams/invite", payload).then((r) => r.data);

export const resendInvite = (uuid: string) =>
  instance.post<void>(`/teams/${uuid}/resend-invite`).then((r) => r.data);

export const remove = (uuid: string) =>
  instance.delete<void>(`/teams/${uuid}`).then((r) => r.data);
