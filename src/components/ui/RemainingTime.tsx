import discountOfferTime from "@/utils/discountOffterTime";

const RemainingTime = ({ expireDate }: { expireDate: string }) => {
  const timeLeft = discountOfferTime(expireDate);
  const formatTimeUnit = (unit: number) => {
    const str = String(unit).padStart(2, "0");
    return [str[0], str[1]];
  };
  return (
    <div>
      <div className="flex flex-row-reverse  gap-1">
        <div className="flex items-center flex-col">
          <div className="flex flex-row-reverse gap-1">
            {formatTimeUnit(timeLeft?.days!).map((digit, i) => (
              <span
                key={`days-${i}`}
                className="bg-first text-white text-sm leading-1.5 rounded-sm h-6 flex justify-center items-center w-6"
              >
                {digit}
              </span>
            ))}
          </div>
          <span className="flex font-f-light first-text-color-for-paragraph text-xs mt-1 ">
            روز
          </span>
        </div>
        <div className="flex items-center flex-col">
          <div className="flex flex-row-reverse gap-1">
            {formatTimeUnit(timeLeft?.hours!).map((digit, i) => (
              <span
                key={`hours-${i}`}
                className="bg-first text-white text-sm leading-1.5 rounded-sm h-6 flex justify-center items-center w-6"
              >
                {digit}
              </span>
            ))}
          </div>
          <span className="flex font-f-light first-text-color-for-paragraph text-xs mt-1 ">
            ساعت
          </span>
        </div>
        <div className="flex items-center flex-col">
          <div className="flex flex-row-reverse gap-1">
            {formatTimeUnit(timeLeft?.minutes!).map((digit, i) => (
              <span
                key={`minutes-${i}`}
                className="bg-first text-white text-sm leading-1.5 rounded-sm h-6 flex justify-center items-center w-6"
              >
                {digit}
              </span>
            ))}
          </div>
          <span className="flex font-f-light first-text-color-for-paragraph text-xs mt-1 ">
            دقیقه
          </span>
        </div>
        <div className="flex items-center flex-col">
          <div className="flex flex-row-reverse gap-1">
            {formatTimeUnit(timeLeft?.seconds!).map((digit, i) => (
              <span
                key={`seconds-${i}`}
                className="bg-first text-white text-sm leading-1.5 rounded-sm h-6 flex justify-center items-center w-6"
              >
                {digit}
              </span>
            ))}
          </div>
          <span className="flex font-f-light first-text-color-for-paragraph text-xs mt-1 ">
            ثانیه
          </span>
        </div>
      </div>
    </div>
  );
};

export default RemainingTime;
