import { Link, useLocation } from 'react-router-dom';
import { House, Grid2x2, ShoppingCart, Newspaper, User2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useAuth } from '@/context/AuthContext';
import useCartStore from '@/stores/cartStore';
import { stripLangPrefix } from '@/utils/langRouting';
import { cn } from '@/utils/cn';

type NavItemKey = 'home' | 'categories' | 'cart' | 'blog' | 'user';

const navItemConfig = [
  { key: 'home', icon: House },
  { key: 'categories', icon: Grid2x2 },
  { key: 'cart', icon: ShoppingCart },
  { key: 'blog', icon: Newspaper },
  { key: 'user', icon: User2 },
] as const;

function isActiveNavItem(key: NavItemKey, path: string): boolean {
  switch (key) {
    case 'home':
      return path === '/';
    case 'categories':
      return path.startsWith('/categories') || path.startsWith('/products');
    case 'cart':
      return path.startsWith('/cart');
    case 'blog':
      return path.startsWith('/blogs');
    case 'user':
      return path.startsWith('/profile') || path.startsWith('/auth');
    default:
      return false;
  }
}

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const localizedPath = useLocalizedPath();
  const { isAuthenticated } = useAuth();
  const cartCount = useCartStore((store) => store.itemCount);

  const basePath = stripLangPrefix(location.pathname);
  const userLabel = isAuthenticated
    ? t('nav.profile') || t('nav.user') || 'Profile'
    : t('nav.user') || 'User';

  const userTarget = localizedPath(isAuthenticated ? '/profile' : '/auth');
  const navTargets: Record<NavItemKey, string> = {
    home: localizedPath('/'),
    categories: localizedPath('/categories'),
    cart: localizedPath('/cart'),
    blog: localizedPath('/blogs'),
    user: userTarget,
  };

  const navLabels: Record<NavItemKey, string> = {
    home: t('nav.home') || 'Home',
    categories: t('nav.categories') || 'Categories',
    cart: t('nav.cart') || 'Cart',
    blog: t('nav.blog') || 'Blog',
    user: userLabel,
  };

  return (
    <div className="lg:hidden fixed inset-x-3 bottom-2 z-[30]">
      <nav
        aria-label={t('nav.mobileBarLabel') || 'Main mobile navigation'}
        className="rounded-3xl border border-gray-300/40 bg-color-for-layer-on-body px-2 pt-2 shadow-dark-sm backdrop-blur-xl"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.45rem)' }}
      >
        <ul className="grid grid-cols-5 gap-1">
          {navItemConfig.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveNavItem(item.key, basePath);

            return (
              <li key={item.key}>
                <Link
                  to={navTargets[item.key]}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-[3.75rem] flex-col items-center justify-center rounded-2xl px-1 transition-colors',
                    isActive
                      ? 'bg-first/10 text-first'
                      : 'first-text-color-for-paragraph-low hover:bg-color-for-layer-sec',
                  )}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                    {item.key === 'cart' && cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-4 rounded-full bg-secound px-1 text-center text-[10px] leading-4 text-white">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'mt-1 text-[11px] leading-4',
                      isActive ? 'font-s-sbold text-first' : 'font-f-normal',
                    )}
                  >
                    {navLabels[item.key]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
