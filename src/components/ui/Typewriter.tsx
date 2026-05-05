import { useEffect, useState } from "react";

function Typewriter({
  text,
  start,
}: {
  text: string;
  start: boolean;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!start) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;

      if (i >= text.length) clearInterval(interval);
    }, 36);

    return () => clearInterval(interval);
  }, [text, start]);

  return <>{displayed}</>;
}

export default Typewriter;