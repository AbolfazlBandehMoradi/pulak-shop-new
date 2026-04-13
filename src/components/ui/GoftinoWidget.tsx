import { useEffect } from "react";

const GoftinoWidget = () => {
  useEffect(() => {
    const i = "Gudra6";

    const g = () => {
      const script = document.createElement("script");
      const l = localStorage.getItem("goftino_" + i);

      script.async = true;
      script.src = l
        ? `https://www.goftino.com/widget/${i}?o=${l}`
        : `https://www.goftino.com/widget/${i}`;

      document.head.appendChild(script);
    };

    window.addEventListener("load", g);
    return () => window.removeEventListener("load", g);
  }, []);

  return null;
};

export default GoftinoWidget;
