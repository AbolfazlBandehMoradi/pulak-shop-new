import { useLangStore } from '@/stores/languageStore';

const IndexLoading = () => {
  const lang = useLangStore((s) => s.lang);

  const title = lang === 'fa' ? 'به بهشت زیبایی پولک خوش آمدید' : 'Welcome to PulakShop';

  const subtitle = lang === 'fa' ? '' : '';

  return (
    <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-50">
      {/* medical spinner */}
      <div className="relative w-16 h-16 animate-[spin_1.8s_linear_infinite]">
        {/* large dot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-first animate-pulse" />

        {/* medium dot */}
        <div className="absolute bottom-2 right-0 w-3 h-3 rounded-full bg-secound animate-pulse [animation-delay:150ms]" />

        {/* small dot */}
        <div className="absolute bottom-2 left-0 w-2.5 h-2.5 rounded-full bg-third animate-pulse [animation-delay:300ms]" />
      </div>

      {/* text */}
      <p className="mt-6 text-lg font-s-sbold first-text-color">{title}</p>
      <p className="mt-1 text-sm text-gray-500 text-center px-4">{subtitle}</p>
    </div>
  );
};

export default IndexLoading;
