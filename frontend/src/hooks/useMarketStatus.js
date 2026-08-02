/**
 * useMarketStatus — determines if US stock market is currently open.
 * Used to control refetch intervals (frequent during market hours, off otherwise).
 */
import { useMemo } from "react";

export function useMarketStatus() {
  return useMemo(() => {
    const now = new Date();
    // Convert to ET
    const et = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );
    const day = et.getDay(); // 0=Sun, 6=Sat
    const hour = et.getHours();
    const minute = et.getMinutes();
    const timeVal = hour * 60 + minute;

    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = isWeekday && timeVal >= 570 && timeVal <= 960; // 9:30-16:00
    const isExtended =
      isWeekday && ((timeVal >= 420 && timeVal < 570) || (timeVal > 960 && timeVal <= 1080)); // 7-9:30, 16-18

    return {
      isOpen: isMarketHours,
      isExtended,
      isClosed: !isMarketHours && !isExtended,
      /** refetchInterval in ms — 60s during market, 5min extended, false when closed */
      refetchInterval: isMarketHours ? 60000 : isExtended ? 300000 : false,
      label: isMarketHours ? "Market Open" : isExtended ? "Extended Hours" : "Market Closed",
    };
  }, []);
}
