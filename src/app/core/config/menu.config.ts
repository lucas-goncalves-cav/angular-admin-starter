export interface MenuItem {
  title: string;
  route: string;
  icon: string;
  roles?: string[];
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
}

export const MENU: MenuSection[] = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', route: '/dashboard', icon: 'dashboard' }]
  },
  {
    label: 'Management',
    items: [
      { title: 'Users', route: '/users', icon: 'users', roles: ['admin', 'manager'] },
      { title: 'Products', route: '/products', icon: 'products' }
    ]
  }
];
