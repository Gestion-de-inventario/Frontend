export interface QuickAccess {
  title: string;
  description: string;
  icon: string;
  route: string;
  permissions?: string[];
  requireAllPermissions?: boolean;
}
