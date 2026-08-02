import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Page, NotFoundView } from "@/components/shared";

describe("Page component", () => {
  it("renders title when provided", () => {
    const { getByText } = render(
      <Page title="Test Page">
        <p>content</p>
      </Page>,
    );
    expect(getByText("Test Page")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(
      <Page title="X">
        <p>Hello World</p>
      </Page>,
    );
    expect(getByText("Hello World")).toBeInTheDocument();
  });

  it("renders without title", () => {
    const { getByText } = render(
      <Page>
        <p>No title</p>
      </Page>,
    );
    expect(getByText("No title")).toBeInTheDocument();
  });
});

describe("NotFoundView", () => {
  it("renders 404 message", () => {
    const { getByText } = render(<NotFoundView />);
    expect(getByText("404 — Not Found")).toBeInTheDocument();
  });
});
