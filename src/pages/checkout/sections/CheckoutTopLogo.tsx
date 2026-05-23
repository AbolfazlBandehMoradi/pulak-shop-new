import { Link } from 'react-router-dom';
import MainLogo from '@/assets/Images/Logo/MainLogo.png';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

export function CheckoutTopLogo() {
  const localizedPath = useLocalizedPath();

  return (
    <div className="mb-6 flex justify-center lg:mb-8">
      <Link
        to={localizedPath('/')}
        className="inline-flex items-center rounded-2xl p-2 transition-transform duration-200 hover:scale-[1.02]"
      >
        <img src={MainLogo} alt="Pulak Shop logo" className="h-12 w-auto sm:h-14" />
      </Link>
    </div>
  );
}
