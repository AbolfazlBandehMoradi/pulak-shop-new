import { useLangStore } from "@/stores/languageStore";
import useDiscountOfferTime from "@/utils/discountOffterTime";

const RemainingTime = ({ expireDate }: { expireDate: string }) => {
  const lang = useLangStore((s) => s.lang);
  const timeLeft = useDiscountOfferTime(expireDate);

  if (!timeLeft.isValid) {
    return null;
  }

  const locale = lang === "fa" ? "fa-IR" : "en-US";
  const numberFormatter = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  const units = [
    { key: lang === "fa" ? "\u0631\u0648\u0632" : "Day", value: timeLeft.days },
    { key: lang === "fa" ? "\u0633\u0627\u0639\u062a" : "Hour", value: timeLeft.hours },
    { key: lang === "fa" ? "\u062f\u0642\u06cc\u0642\u0647" : "Min", value: timeLeft.minutes },
    { key: lang === "fa" ? "\u062b\u0627\u0646\u06cc\u0647" : "Sec", value: timeLeft.seconds },
  ];

  const flexDirectionClass = lang === "fa" ? "flex-row-reverse" : "flex-row";

  return (
    <div className={`flex ${flexDirectionClass} gap-1`}>
      {units.map((unit) => (
        <div key={unit.key} className="flex items-center flex-col">
          <div className={`flex ${flexDirectionClass} gap-1`}>
            {numberFormatter
              .format(unit.value)
              .split("")
              .map((digit, i) => (
                <span
                  key={`${unit.key}-${i}`}
                  className="bg-first text-white text-sm leading-1.5 rounded-sm h-6 w-6 flex items-center justify-center"
                >
                  {digit}
                </span>
              ))}
          </div>
          <span className="mt-1 flex text-xs font-f-light first-text-color-for-paragraph">
            {unit.key}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RemainingTime;
