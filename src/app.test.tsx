// @vitest-environment jsdom
import React from "react";
import { it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
it("creates a workshop, registers and marks attendance, and previews a certificate", async () => {
  window.scrollTo = vi.fn();
  document.body.innerHTML = '<div id="root"></div>';
  await import("./main");
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "My workspace" }));
  await user.click(screen.getByRole("button", { name: "New workshop" }));
  await user.type(screen.getByLabelText("Workshop title"), "Testing together");
  await user.type(
    screen.getByLabelText("Description"),
    "A practical testing workshop",
  );
  await user.type(screen.getByLabelText("Host"), "Demo Host");
  await user.type(
    screen.getByLabelText("Location or meeting details"),
    "Online",
  );
  await user.click(screen.getByRole("button", { name: "Save workshop" }));
  await screen.findByRole("heading", { name: "Testing together" });
  await user.type(screen.getByLabelText("Your name"), "Test Person");
  await user.type(screen.getByLabelText("Email address"), "test@example.com");
  await user.click(screen.getByRole("button", { name: "Count me in" }));
  await user.click(screen.getByRole("button", { name: "Participants" }));
  expect(screen.getByText("Test Person")).toBeTruthy();
  await user.click(screen.getByRole("checkbox", { name: "Attended" }));
  await user.click(screen.getByRole("button", { name: "Certificates" }));
  await user.click(screen.getByRole("button", { name: "Preview certificate" }));
  expect(
    screen.getByRole("heading", { name: "Certificate of Completion" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Close dialog" }));
  await user.click(screen.getByRole("button", { name: "Resources" }));
  await user.type(screen.getByLabelText("Resource title"), "Useful guide");
  await user.type(
    screen.getByLabelText("Resource URL"),
    "https://example.com/guide",
  );
  await user.click(screen.getByRole("button", { name: "Add resource" }));
  expect(
    screen.getByRole("link", { name: /Useful guide/ }).getAttribute("href"),
  ).toBe("https://example.com/guide");
  await user.click(screen.getByRole("button", { name: "Feedback" }));
  await user.type(screen.getByLabelText("Your name"), "Happy learner");
  await user.type(screen.getByLabelText("Your reflection"), "A useful session");
  await user.click(screen.getByRole("button", { name: "Share feedback" }));
  expect(screen.getByText("A useful session")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Share workshop" }));
  expect(
    screen.getByLabelText("Workshop preview link").getAttribute("value"),
  ).toContain("?workshop=");
  await user.click(screen.getByRole("button", { name: "Close dialog" }));
  await user.click(screen.getByRole("button", { name: /Back to workspace/ }));
  await waitFor(() =>
    expect(screen.getByText("Testing together")).toBeTruthy(),
  );
});
