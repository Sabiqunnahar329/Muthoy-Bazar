// Admin modules a staff member can be given access to.
export const MODULES = ['dashboard', 'products', 'sales', 'stock', 'customers', 'expenses', 'coupons', 'landing', 'staff', 'reports', 'security', 'menu', 'notifications', 'support', 'settings'];

// Default access per role, used when a user has no custom permission list.
export const ROLE_DEFAULTS = {
  super_admin: MODULES,
  admin: MODULES,
  inventory_manager: ['dashboard', 'products', 'stock', 'sales', 'customers', 'reports', 'landing', 'notifications'],
  delivery_operator: ['dashboard', 'sales', 'customers', 'notifications', 'support'],
  customer: [],
};

export const effective = (u) => (u.role === 'super_admin' ? MODULES : u.permissions?.length ? u.permissions : ROLE_DEFAULTS[u.role] || []);
