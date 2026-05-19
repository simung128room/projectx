import { UserPlan } from "../types";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function getUserRank(userPlan: UserPlan | null, user: SupabaseUser | null): string {
  if (userPlan?.role && ['admin', 'owner', 'vip', 'premium'].includes(userPlan.role.toLowerCase())) {
    const rawRole = userPlan.role;
    return rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
  }

  const createdDateStr = userPlan?.registeredAt || user?.created_at;
  if (!createdDateStr) return "NEW MEMBER";

  const createdDate = new Date(createdDateStr);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays >= 90) return "OLD MEMBER";
  if (diffDays >= 7) return "MEMBER";
  
  return "NEW MEMBER";
}
