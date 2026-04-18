import { describe, expect, it } from "vitest";
import { parseApiJsonResponse } from "./apiJson";

describe("parseApiJsonResponse", () => {
  it("throws helpful error for HTML body", async () => {
    const response = new Response("<!DOCTYPE html><html></html>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

    await expect(parseApiJsonResponse(response)).rejects.toThrow(/JSON 대신 HTML/);
  });

  it("parses valid JSON", async () => {
    const response = new Response(JSON.stringify({ ok: true, heroSlides: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const data = await parseApiJsonResponse(response);
    expect(data.ok).toBe(true);
  });
});
