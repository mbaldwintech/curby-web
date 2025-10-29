//condition jsonb check (condition is null or (condition->>'type' = 'sql' and condition->>'label' is not null and condition->>'query' is not null)),  -- optional json conditions for awarding (e.g., {"type": "sql", "query": "select count(*) = 1 as result from public.items where userId = :userId", "params": {"userId": "recipientId"}})

export interface SqlCondition {
  type: 'sql';
  label: string;
  query: string;
  params: Record<string, string>;
}

export type Condition = SqlCondition;
