// organizerApi.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/common/api/axios";
import { OrganizerEntity } from "./entity";


// 1. GET all organizers
export async function getAllOrganizers(): Promise<OrganizerEntity[]> {
  return apiFetch<OrganizerEntity[]>("/organizers", {
    method: "GET",
  });
}

// 2. GET one organizer by ID
export async function getOrganizer(id: string): Promise<OrganizerEntity> {
  return apiFetch<OrganizerEntity>(`/organizers/${id}`, {
    method: "GET",
  });
}

// 3. CREATE an organizer
export async function createOrganizer(
  data: Omit<OrganizerEntity, "id">,
): Promise<OrganizerEntity> {
  return apiFetch<OrganizerEntity>("/organizers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 4. UPDATE (PATCH) an organizer
export async function updateOrganizer(
  id: string,
  data: Partial<Omit<OrganizerEntity, "id">>,
): Promise<OrganizerEntity> {
  return apiFetch<OrganizerEntity>(`/organizers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// etc. for DELETE, or other endpoints ...

/**
 * Query Keys
 *
 * You had something similar in your code before,
 * but this is a straightforward approach:
 */
export const organizerQueryKeys = {
  all: ["organizers"] as const,
  detail: (id: string) => ["organizer", id] as const,
};

/**
 * 1) Hook for reading all organizers
 */
export function useAllOrganizers() {
  return useQuery<OrganizerEntity[]>({
    queryKey: organizerQueryKeys.all,
    queryFn: () => getAllOrganizers(),
  });
}

/**
 * 2) Hook for reading one organizer
 */
export function useOrganizer(id: string) {
  return useQuery<OrganizerEntity>({
    queryKey: organizerQueryKeys.detail(id),
    queryFn: () => getOrganizer(id),
    enabled: Boolean(id), // only run if ID is defined
  });
}

/**
 * 3) Hook for creating an organizer
 */
export function useCreateOrganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newData: Omit<OrganizerEntity, "id">) =>
      createOrganizer(newData),
    onSuccess: () => {
      // Invalidate all organizers list
      queryClient.invalidateQueries({ queryKey: organizerQueryKeys.all });
    },
  });
}

/**
 * 4) Hook for updating an organizer
 */
export function useUpdateOrganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<OrganizerEntity, "id">>;
    }) => updateOrganizer(id, data),
    onSuccess: (updated) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: organizerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: organizerQueryKeys.detail(updated.id),
      });
    },
  });
}
