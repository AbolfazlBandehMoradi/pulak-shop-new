const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-15 min-h-30">
      <div className="relative w-10 h-10 animate-[spin_1.8s_linear_infinite]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-first animate-pulse" />
        <div className="absolute bottom-1 right-0 w-2.5 h-2.5 rounded-full bg-secound animate-pulse [animation-delay:150ms]" />
        <div className="absolute bottom-1 left-0 w-2 h-2 rounded-full bg-third animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
};

export default Spinner;