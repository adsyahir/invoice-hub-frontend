import { instance } from "./axios";
import type { ApiResponse } from "./types";
import type { User, UserRole } from "@/types";

export interface InviteInput {
  email: string;
  role: UserRole | string;
}

export const list = () =>
  instance.get<ApiResponse<User[]>>("/teams").then((r) => r.data.data);

export const invite = (payload: InviteInput) =>
  instance.post<ApiResponse<User>>("/teams/invite", payload).then((r) => r.data.data);

export const resendInvite = (id: string) =>
  instance.post<ApiResponse<void>>(`/teams/${id}/resend-invite`).then((r) => r.data.data);

export const remove = (id: string) =>
  instance.delete<ApiResponse<void>>(`/teams/${id}`).then((r) => r.data.data);
