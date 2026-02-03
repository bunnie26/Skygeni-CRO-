export interface Account {
  account_id: string;
  name: string;
  industry: string;
  segment: string;
}

export interface Rep {
  rep_id: string;
  name: string;
}

export interface Deal {
  deal_id: string;
  account_id: string;
  rep_id: string;
  stage: string;
  amount: number | null;
  created_at: string;
  closed_at: string | null;
}

export interface Activity {
  activity_id: string;
  deal_id: string;
  type: string;
  timestamp: string;
}

export interface Target {
  month: string;
  target: number;
}
