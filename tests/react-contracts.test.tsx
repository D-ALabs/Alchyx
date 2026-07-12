import * as React from "react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Alert,
  AlchyxProvider,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Progress,
  RadioGroup,
  RadioGroupItem,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  Slider,
  Switch,
  useAlchyx,
} from "../packages/react/src";

function ThemeProbe() {
  const { skin, accent, setSkin } = useAlchyx();
  return (
    <>
      <output data-testid="theme-value">{`${skin}:${accent ?? "default"}`}</output>
      <button type="button" onClick={() => setSkin("ark")}>Ark</button>
    </>
  );
}

describe("theme and activation contracts", () => {
  it("normalizes an accent when the skin changes", async () => {
    const user = userEvent.setup();
    render(
      <AlchyxProvider defaultSkin="lab" defaultAccent="mint">
        <ThemeProbe />
      </AlchyxProvider>,
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("lab:mint");
    await user.click(screen.getByRole("button", { name: "Ark" }));
    expect(screen.getByTestId("theme-value").textContent).toBe("ark:gold");
  });

  it("prevents mouse and keyboard activation for a disabled asChild link", () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="#destination">Unavailable</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Unavailable" });
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.tabIndex).toBe(-1);
    expect(fireEvent.click(link)).toBe(false);
    expect(fireEvent.keyDown(link, { key: "Enter" })).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });
});

function FormHarness() {
  return (
    <form aria-label="Preferences">
      <Switch name="alerts" value="enabled" label="Notifications" />
      <RadioGroup name="plan" defaultValue="free" required aria-label="Plan">
        <RadioGroupItem value="free" label="Free" />
        <RadioGroupItem value="pro" label="Pro" />
      </RadioGroup>
      <SegmentedControl name="view" defaultValue="grid" required aria-label="View">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>
      <Slider name="volume" defaultValue={30} aria-label="Volume" />
      <Checkbox name="terms" value="accepted" defaultChecked label="Terms" />
      <Select
        name="region"
        label="Region"
        defaultValue="kr"
        options={[
          { label: "Korea", value: "kr" },
          { label: "Japan", value: "jp" },
        ]}
      />
      <button type="reset">Reset</button>
    </form>
  );
}

describe("native form participation", () => {
  it("submits values and restores uncontrolled defaults on form reset", async () => {
    const user = userEvent.setup();
    render(<FormHarness />);

    const form = screen.getByRole("form", { name: "Preferences" }) as HTMLFormElement;
    const plan = screen.getByRole("radiogroup", { name: "Plan" });
    const view = screen.getByRole("radiogroup", { name: "View" });
    const slider = screen.getByRole("slider", { name: "Volume" });

    await user.click(screen.getByText("Notifications"));
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    await user.click(within(plan).getByRole("radio", { name: "Pro" }));
    await user.click(within(view).getByRole("radio", { name: "List" }));
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await user.selectOptions(screen.getByLabelText("Region"), "jp");

    const submitted = new FormData(form);
    expect(submitted.get("alerts")).toBe("enabled");
    expect(submitted.get("plan")).toBe("pro");
    expect(submitted.get("view")).toBe("list");
    expect(submitted.get("volume")).toBe("31");
    expect(submitted.get("terms")).toBe("accepted");
    expect(submitted.get("region")).toBe("jp");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => {
      expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
      expect(within(plan).getByRole("radio", { name: "Free" }).getAttribute("aria-checked")).toBe("true");
      expect(within(view).getByRole("radio", { name: "Grid" }).getAttribute("aria-checked")).toBe("true");
      expect(slider.getAttribute("aria-valuenow")).toBe("30");
      expect((screen.getByLabelText("Region") as HTMLSelectElement).value).toBe("kr");
    });
  });

  it("moves required proxy validation to the visible composite", () => {
    render(
      <form>
        <RadioGroup name="plan" required aria-label="Required plan">
          <RadioGroupItem value="free" label="Free" />
          <RadioGroupItem value="pro" label="Pro" />
        </RadioGroup>
      </form>,
    );

    const proxy = document.querySelector<HTMLInputElement>('input[name="plan"]');
    expect(proxy).not.toBeNull();
    fireEvent.invalid(proxy!);
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Free" }));
  });
});

function OverlayHarness() {
  return (
    <AlchyxProvider defaultSkin="ark">
      <Dialog>
        <DialogTrigger>Open settings</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Nested overlay test</DialogDescription>
          <DropdownMenu>
            <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>
    </AlchyxProvider>
  );
}

describe("nested overlays", () => {
  it("composes DialogTrigger asChild with Button activation", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Request a demo</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Demo request</DialogTitle>
          <DialogDescription>Composed trigger test</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Request a demo" }));
    expect(await screen.findByRole("dialog", { name: "Demo request" })).toBeTruthy();
  });

  it("dismisses only the top layer, preserves theme scope, and restores focus", async () => {
    const user = userEvent.setup();
    render(<OverlayHarness />);

    const dialogTrigger = screen.getByRole("button", { name: "Open settings" });
    await user.click(dialogTrigger);
    const dialog = await screen.findByRole("dialog");
    expect(dialog.closest(".alx-portal-scope")?.getAttribute("data-theme")).toBe("ark");
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(dialogTrigger);
  });
});

describe("representative accessibility", () => {
  it("has no axe violations in stable form and feedback primitives", async () => {
    const { container } = render(
      <AlchyxProvider>
        <Alert title="Saved">Your changes are live.</Alert>
        <Input label="Email" type="email" />
        <Checkbox label="Email updates" />
        <Progress value={65} aria-label="Upload progress" />
      </AlchyxProvider>,
    );

    // jsdom has no canvas-backed computed color model; token contrast is
    // covered separately by packages/tokens/scripts/check-contract.mjs.
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
