import { FinanceEntity, Status } from "./entity";
import { apiFetch } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export async function getAllFinances(): Promise<FinanceEntity[]> {
  return apiFetch<FinanceEntity[]>("/finances", {
    method: "GET",
  });
}

export async function getFinance(id: string): Promise<FinanceEntity> {
  return apiFetch<FinanceEntity>(`/finances/${id}`, {
    method: "GET",
  });
}

export async function createFinance(
  data: Omit<
    FinanceEntity,
    "id" | "createdAt" | "hackathonId" | "updatedBy" | "receiptUrl" | "status"
  >
): Promise<FinanceEntity> {
  return apiFetch<FinanceEntity>("/finances", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createFinanceWithForm(
  formData: FormData
): Promise<FinanceEntity> {
  return apiFetch<FinanceEntity>("/finances", {
    method: "POST",
    body: formData,
  });
}

export async function updateFinanceStatus(
  id: string,
  status: Status
): Promise<FinanceEntity> {
  return apiFetch<FinanceEntity>(`/finances/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Query Keys
export const financeKeys = {
  all: ["finances"] as const,
  lists: () => [...financeKeys.all] as const,
  detail: (id: string) => [...financeKeys.all, id] as const,
  cheque: (id: string) => [...financeKeys.all, id, "cheque"] as const,
};

// Existing Query Hooks
export function useAllFinances() {
  return useQuery<FinanceEntity[]>({
    queryKey: financeKeys.lists(),
    queryFn: () => getAllFinances(),
  });
}

export function useFinance(id: string) {
  return useQuery<FinanceEntity>({
    queryKey: financeKeys.detail(id),
    queryFn: () => getFinance(id),
    enabled: Boolean(id),
  });
}

export function useCheque(id: string) {
  return useQuery<Blob>({
    queryKey: financeKeys.cheque(id),
    queryFn: () => getCheque(id),
    enabled: Boolean(id),
  });
}

// Mutation Hooks
export function useCreateFinance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      newData: Omit<
        FinanceEntity,
        | "id"
        | "createdAt"
        | "hackathonId"
        | "updatedBy"
        | "receiptUrl"
        | "status"
      >
    ) => createFinance(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.lists() });
    },
  });
}

export function useCreateFinanceWithForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createFinanceWithForm(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.lists() });
    },
  });
}

export function useUpdateFinanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    // Receives an object: { id, status }, or you can pass them separately
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      return updateFinanceStatus(id, status);
    },
    onSuccess: () => {
      // Re-fetch the entire finances list so UI is up to date
      queryClient.invalidateQueries({ queryKey: financeKeys.lists() });
    },
  });
}
