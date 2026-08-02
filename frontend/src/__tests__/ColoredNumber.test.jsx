import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ColoredNumber } from "@/components/shared";

describe("ColoredNumber", () => {
  it("renders positive numbers in green", () => {
    const { container } = render(<ColoredNumber val={5.23} />);
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ color: "#10b981" });
    expect(span.textContent).toBe("5.23");
  });

  it("renders negative numbers in red", () => {
    const { container } = render(<ColoredNumber val={-3.14} />);
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ color: "#ef4444" });
    expect(span.textContent).toBe("-3.14");
  });

  it("renders zero in green", () => {
    const { container } = render(<ColoredNumber val={0} />);
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ color: "#10b981" });
    expect(span.textContent).toBe("0.00");
  });

  it("renders dash for NaN/null values", () => {
    const { container } = render(<ColoredNumber val={null} />);
    const span = container.querySelector("span");
    expect(span.textContent).toBe("-");
  });

  it("respects unit suffix", () => {
    const { container } = render(<ColoredNumber val={12.5} unit="%" />);
    const span = container.querySelector("span");
    expect(span.textContent).toBe("12.50%");
  });

  it("respects roundTo parameter", () => {
    const { container } = render(<ColoredNumber val={3.14159} roundTo={1} />);
    const span = container.querySelector("span");
    expect(span.textContent).toBe("3.1");
  });
});
