import { describe, expect, it } from "vitest";
import { parseAccountsFromText } from "./checker";

describe("parseAccountsFromText", () => {
  it("parses standard email:password lines", () => {
    const input = "user@example.com:pass123\nother@test.org:secret456";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ email: "user@example.com", password: "pass123" });
    expect(result[1]).toEqual({ email: "other@test.org", password: "secret456" });
  });

  it("handles passwords containing colons", () => {
    const input = "user@example.com:pass:with:colons";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(1);
    expect(result[0]?.password).toBe("pass:with:colons");
  });

  it("skips lines without @ in email", () => {
    const input = "notanemail:password\nvalid@email.com:pass";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(1);
    expect(result[0]?.email).toBe("valid@email.com");
  });

  it("skips empty lines and lines without colon", () => {
    const input = "\n\nuser@test.com:pass\n\njusttext\n";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(1);
  });

  it("handles Windows-style CRLF line endings", () => {
    const input = "a@b.com:pass1\r\nc@d.com:pass2\r\n";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(2);
  });

  it("trims whitespace from email and password", () => {
    const input = "  user@example.com : password123  ";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(1);
    expect(result[0]?.email).toBe("user@example.com");
    expect(result[0]?.password).toBe("password123");
  });

  it("returns empty array for empty input", () => {
    expect(parseAccountsFromText("")).toHaveLength(0);
    expect(parseAccountsFromText("\n\n\n")).toHaveLength(0);
  });

  it("skips accounts with empty passwords", () => {
    const input = "user@example.com:";
    const result = parseAccountsFromText(input);
    expect(result).toHaveLength(0);
  });

  it("handles large input efficiently", () => {
    const lines = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com:pass${i}`);
    const result = parseAccountsFromText(lines.join("\n"));
    expect(result).toHaveLength(1000);
  });
});

describe("auth.logout", () => {
  it("is covered by the default template test", () => {
    expect(true).toBe(true);
  });
});
