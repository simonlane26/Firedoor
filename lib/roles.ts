import { UserRole } from '@prisma/client'

export function getRoleDisplayName(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    MANAGER_RESPONSIBLE_PERSON: 'Manager / Responsible Person',
    HOUSING_OFFICER: 'Housing Officer',
    INSPECTOR: 'Inspector',
    AUDITOR: 'Auditor'
  }

  return roleMap[role] || role
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: 'Full system access, user management, and tenant settings',
    MANAGER_RESPONSIBLE_PERSON: 'Building portfolio management, compliance oversight, and reporting',
    HOUSING_OFFICER: 'Building operations, defect management, and contractor coordination',
    INSPECTOR: 'Conduct fire door inspections and record findings',
    AUDITOR: 'Read-only access to all records for compliance auditing'
  }

  return descriptions[role] || ''
}

export const ROLE_PERMISSIONS = {
  ADMIN: {
    canManageUsers: true,
    canManageTenant: true,
    canManageBuildings: true,
    canManageDoors: true,
    canConductInspections: true,
    canViewAllReports: true,
    canExportData: true,
    canManageDefects: true,
    canManageContractors: true,
    readOnly: false
  },
  MANAGER_RESPONSIBLE_PERSON: {
    canManageUsers: false,
    canManageTenant: false,
    canManageBuildings: true,
    canManageDoors: true,
    canConductInspections: false,
    canViewAllReports: true,
    canExportData: true,
    canManageDefects: true,
    canManageContractors: true,
    readOnly: false
  },
  HOUSING_OFFICER: {
    canManageUsers: false,
    canManageTenant: false,
    canManageBuildings: false,
    canManageDoors: false,
    canConductInspections: false,
    canViewAllReports: false, // Only their assigned buildings
    canExportData: true,
    canManageDefects: true,
    canManageContractors: true,
    readOnly: false
  },
  INSPECTOR: {
    canManageUsers: false,
    canManageTenant: false,
    canManageBuildings: false,
    canManageDoors: false,
    canConductInspections: true,
    canViewAllReports: false, // Only inspections they conducted
    canExportData: false,
    canManageDefects: false,
    canManageContractors: false,
    readOnly: false
  },
  AUDITOR: {
    canManageUsers: false,
    canManageTenant: false,
    canManageBuildings: false,
    canManageDoors: false,
    canConductInspections: false,
    canViewAllReports: true,
    canExportData: true,
    canManageDefects: false,
    canManageContractors: false,
    readOnly: true
  }
} as const

export function hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS.ADMIN): boolean {
  return ROLE_PERMISSIONS[role][permission]
}
