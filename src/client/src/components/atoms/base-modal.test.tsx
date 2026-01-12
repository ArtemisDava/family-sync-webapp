import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import BaseModal from "./base-modal";

describe("BaseModal", () => {
  const onClose = vi.fn();

  it("renders correctly when open", () => {
    render(
      <BaseModal open={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    expect(
      screen.getByRole("heading", { name: "Test Modal" })
    ).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <BaseModal open={false} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </BaseModal>
    );

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });
});
