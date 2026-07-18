import assert from "node:assert/strict";
import test from "node:test";

import {
  getMillisecondsUntilNextTheme,
  getThemeColorScheme,
  isTimeTheme,
  resolveTimeTheme,
} from "../src/components/home/timeTheme.ts";

function localTime(hour, minute = 0, second = 0) {
  return new Date(2026, 0, 18, hour, minute, second, 0);
}

test("resolves all four themes at their exact local-time boundaries", () => {
  assert.equal(resolveTimeTheme(localTime(4, 59, 59)), "night");
  assert.equal(resolveTimeTheme(localTime(5)), "dawn");
  assert.equal(resolveTimeTheme(localTime(10, 59, 59)), "dawn");
  assert.equal(resolveTimeTheme(localTime(11)), "day");
  assert.equal(resolveTimeTheme(localTime(16, 59, 59)), "day");
  assert.equal(resolveTimeTheme(localTime(17)), "dusk");
  assert.equal(resolveTimeTheme(localTime(19, 59, 59)), "dusk");
  assert.equal(resolveTimeTheme(localTime(20)), "night");
});

test("schedules the next boundary, including the overnight rollover", () => {
  assert.equal(getMillisecondsUntilNextTheme(localTime(10, 59, 30)), 30_100);
  assert.equal(
    getMillisecondsUntilNextTheme(localTime(20)),
    9 * 60 * 60 * 1_000 + 100,
  );
});

test("maps themes to browser color schemes and rejects legacy values", () => {
  assert.equal(getThemeColorScheme("dawn"), "light");
  assert.equal(getThemeColorScheme("day"), "light");
  assert.equal(getThemeColorScheme("dusk"), "dark");
  assert.equal(getThemeColorScheme("night"), "dark");
  assert.equal(isTimeTheme("night"), true);
  assert.equal(isTimeTheme("dark"), false);
});
