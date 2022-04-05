import { useEffect, useState } from "react";

export function useCurrentDate({ refreshInterval = 1000 } = {}) {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timeoutId = setTimeout(() => setDate(new Date()), refreshInterval);
    return () => clearTimeout(timeoutId);
  }, [date]);
  return date;
}
