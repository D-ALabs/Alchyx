import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import {
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  Slider,
  Switch,
  normalizeAccent,
} from "../dist/index.js";

assert.equal(normalizeAccent("lab", "mint"), "mint");
assert.equal(normalizeAccent("ark", "mint"), "gold");
assert.equal(normalizeAccent("dark", "bronze"), "paper");
assert.equal(normalizeAccent("ark", undefined), undefined);

const formMarkup = renderToStaticMarkup(
  React.createElement(
    React.Fragment,
    null,
    React.createElement("form", { id: "prefs" }),
    React.createElement(Switch, {
      name: "alerts",
      value: "enabled",
      defaultChecked: true,
      required: true,
      form: "prefs",
      label: "Alerts",
    }),
    React.createElement(
      RadioGroup,
      { name: "plan", defaultValue: "pro", required: true, form: "prefs" },
      React.createElement(RadioGroupItem, { value: "free", label: "Free" }),
      React.createElement(RadioGroupItem, { value: "pro", label: "Pro" }),
    ),
    React.createElement(
      SegmentedControl,
      { name: "view", defaultValue: "grid", required: true, form: "prefs" },
      React.createElement(SegmentedControlItem, { value: "list" }, "List"),
      React.createElement(SegmentedControlItem, { value: "grid" }, "Grid"),
    ),
    React.createElement(Slider, {
      name: "volume",
      defaultValue: 40,
      form: "prefs",
      "aria-label": "Volume",
    }),
    React.createElement(Checkbox, {
      name: "terms",
      value: "accepted",
      defaultChecked: true,
      required: true,
      form: "prefs",
      label: "Terms",
    }),
    React.createElement(Select, {
      name: "region",
      defaultValue: "kr",
      required: true,
      form: "prefs",
      options: [{ label: "Korea", value: "kr" }],
    }),
  ),
);

for (const expected of [
  'name="alerts"',
  'value="enabled"',
  'name="plan"',
  'value="pro"',
  'name="view"',
  'value="grid"',
  'name="volume"',
  'value="40"',
  'name="terms"',
  'value="accepted"',
  'name="region"',
  'form="prefs"',
  "required",
]) {
  assert.ok(formMarkup.includes(expected), `Expected server markup to contain ${expected}`);
}

const switchLabel = formMarkup.match(/<label[^>]*for="([^"]+)"[^>]*>Alerts<\/label>/);
assert.ok(switchLabel, "Switch renders an explicit label for the visible control");
assert.ok(
  formMarkup.includes(`<button type="button" role="switch" id="${switchLabel[1]}"`),
  "Switch label targets its visible button",
);

const overlaySource = await readFile(new URL("../src/lib/overlayStack.ts", import.meta.url), "utf8");
const overlayJavaScript = ts.transpileModule(overlaySource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const overlayModule = await import(
  `data:text/javascript;base64,${Buffer.from(overlayJavaScript).toString("base64")}`
);
const firstElement = {};
const secondElement = {};
const nonModalElement = {};
const firstId = Symbol("first");
const secondId = Symbol("second");
const nonModalId = Symbol("non-modal");
const unregisterFirst = overlayModule.registerOverlayLayer({
  id: firstId,
  ref: { current: firstElement },
  blocksParentFocusTrap: true,
});
assert.equal(overlayModule.isTopmostOverlayLayer(firstId), true);
const unregisterSecond = overlayModule.registerOverlayLayer({
  id: secondId,
  ref: { current: secondElement },
  blocksParentFocusTrap: true,
});
assert.equal(overlayModule.isTopmostOverlayLayer(firstId), false);
assert.equal(overlayModule.isTopmostOverlayLayer(secondId), true);
assert.equal(overlayModule.isTopmostOverlayElement(secondElement), true);
const unregisterNonModal = overlayModule.registerOverlayLayer({
  id: nonModalId,
  ref: { current: nonModalElement },
  blocksParentFocusTrap: false,
});
assert.equal(overlayModule.isTopmostOverlayLayer(nonModalId), true);
assert.equal(overlayModule.isTopmostOverlayElement(secondElement), true);
unregisterNonModal();
unregisterFirst();
assert.equal(overlayModule.isTopmostOverlayLayer(secondId), true);
unregisterSecond();

console.log("React package contracts verified.");
