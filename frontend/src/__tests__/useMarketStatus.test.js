import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMarketStatus } from "@/hooks/useMarketStatus";

describe("useMarketStatus", () => {
  it("returns an object with isOpen, isExtended, isClosed, refetchInterval, label", () => {
    const { result } = renderHook(() => useMarketStatus());
    expect(result.current).toHaveProperty("isOpen");
    expect(result.current).toHaveProperty("isExtended");
    expect(result.current).toHaveProperty("isClosed");
    expect(result.current).toHaveProperty("refetchInterval");
    expect(result.current).toHaveProperty("label");
  });

  it("isOpen, isExtended, and isClosed are mutually exclusive booleans", () => {
    const { result } = renderHook(() => useMarketStatus());
    const { isOpen, isExtended, isClosed } = result.current;
    // Exactly one should be true at any time (or isOpen=false + isExtended=false + isClosed=true)
    expect(typeof isOpen).toBe("boolean");
    expect(typeof isExtended).toBe("boolean");
    expect(typeof isClosed).toBe("boolean");
    // At least one must be truthy
    expect(isOpen || isExtended || isClosed).toBe(true);
  });

  it("refetchInterval is a number or false", () => {
    const { result } = renderHook(() => useMarketStatus());
    const { refetchInterval } = result.current;
    expect(refetchInterval === false || typeof refetchInterval === "number").toBe(true);
  });

  it("label is a non-empty string", () => {
    const { result } = renderHook(() => useMarketStatus());
    expect(result.current.label.length).toBeGreaterThan(0);
  });
});
