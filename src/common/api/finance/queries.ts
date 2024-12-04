/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  createMutation,
  CreateMutationReturn,
  createQuery,
  CreateQueryReturn,
} from "@/common/api/utils";
import { FinanceEntity } from "./entity";
import { QueryAction, QueryScope } from "@/common/api/types";

export const getAllFinances: CreateQueryReturn<FinanceEntity[]> =
  createQuery("/finances");

export const getFinance: CreateQueryReturn<FinanceEntity, { id: string }> =
  createQuery("/finances/:id");

export const createFinance: CreateMutationReturn<
  Omit<
    FinanceEntity,
    "id" | "createdAt" | "hackathonId" | "updatedBy" | "receiptUrl"
  >,
  FinanceEntity
> = createMutation("/finances");

export const createFinanceForm: CreateMutationReturn<FormData, FinanceEntity> =
  createMutation("/finances");

export const getCheque: CreateQueryReturn<Blob, { id: string }> = createQuery(
  "/finances/:id/cheque"
);

/**
 * Finance cache keys for queries and mutations
 */
export const FinanceKeys = {
  all: [{ entity: "finance" }] as const,
  findAll: () =>
    [
      {
        ...FinanceKeys.all[0],
        action: QueryAction.query,
        scope: QueryScope.ALL,
      },
    ] as const,
  findById: (id: string) =>
    [
      { ...FinanceKeys.all[0], action: QueryAction.query, scope: [id] },
    ] as const,
  create: () =>
    [{ ...FinanceKeys.all[0], action: QueryAction.create, scope: [] }] as const,
  getCheque: (id: string) =>
    [
      {
        ...FinanceKeys.all[0],
        action: QueryAction.query,
        scope: [id, "cheque"],
      },
    ] as const,
};


