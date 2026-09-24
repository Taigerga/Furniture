import { authedFetch } from "./client";

export type WorkerRow = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  pending: number;
  _count: { productsCreated: number; articlesCreated: number; galleriesCreated: number };
};

export function listWorkers() {
  return authedFetch<WorkerRow[]>("/admin/users/workers", { cache: "no-store" });
}

export function createWorker(payload: { name: string; email: string; password: string }) {
  return authedFetch<{ id: string; email: string }>("/admin/users/workers", { method: "POST", body: payload });
}

export function toggleWorkerActive(id: string, isActive: boolean) {
  return authedFetch<{ id: string; isActive: boolean }>(`/admin/users/workers/${id}/active`, {
    method: "PATCH",
    body: { isActive },
  });
}

export function resetWorkerPassword(id: string, password: string) {
  return authedFetch<{ id: string }>(`/admin/users/workers/${id}/password`, {
    method: "PATCH",
    body: { password },
  });
}

export function updateAccount(payload: { name: string; email: string }) {
  return authedFetch<{ emailChanged: boolean }>("/account", { method: "PATCH", body: payload });
}

export function changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  return authedFetch<{ ok: boolean }>("/account/password", { method: "PATCH", body: payload });
}
