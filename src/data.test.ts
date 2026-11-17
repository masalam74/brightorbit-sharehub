// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { examples, stats, register, load, KEY } from "./data";
beforeEach(() => localStorage.clear());
describe("workshop data workflows", () => {
  it("provides three independent realistic examples and calculated statistics", () => {
    const w = examples();
    expect(w).toHaveLength(3);
    expect(stats(w)).toEqual({
      workshops: 3,
      participants: 18,
      attendance: 50,
      rating: "4.7",
    });
    w[0].title = "changed";
    expect(examples()[0].title).toBe("Creative Thinking Lab");
  });
  it("registers without mutating the original and rejects duplicate email", () => {
    const w = examples()[0];
    const next = register(w, "New Person", "person@example.com");
    expect(w.participants).toHaveLength(8);
    expect(next.participants).toHaveLength(9);
    expect(next.participants.at(-1)?.attended).toBe(false);
    expect(() => register(next, "Other", "PERSON@example.com")).toThrow(
      "already registered",
    );
  });
  it("rejects registration at capacity", () => {
    const w = examples()[0];
    w.capacity = w.participants.length;
    expect(() => register(w, "New", "new@example.com")).toThrow("full");
  });
  it("loads an empty workspace without reinserting examples", () => {
    localStorage.setItem(KEY, JSON.stringify({ workshops: [], events: [] }));
    expect(load().workshops).toHaveLength(0);
  });
  it("recovers safely from malformed persisted JSON", () => {
    localStorage.setItem(KEY, "broken");
    expect(load().workshops).toHaveLength(3);
  });
  it("persists attendee changes across reloads", () => {
    const workshops = examples();
    workshops[0].participants[0].attended = false;
    localStorage.setItem(KEY, JSON.stringify({ workshops, events: [] }));
    expect(load().workshops[0].participants[0].attended).toBe(false);
  });
  it("handles zero denominators", () =>
    expect(stats([])).toEqual({
      workshops: 0,
      participants: 0,
      attendance: 0,
      rating: "—",
    }));
});
