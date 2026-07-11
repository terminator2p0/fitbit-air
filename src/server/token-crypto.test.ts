import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptValue, encryptValue } from "./token-crypto";

describe("token encryption", () => {
  it("round trips a token without storing plaintext", () => {
    const key = randomBytes(32).toString("base64");
    const encrypted = encryptValue("refresh-token", key);

    expect(encrypted.ciphertext).not.toContain("refresh-token");
    expect(decryptValue(encrypted, key)).toBe("refresh-token");
  });

  it("rejects an invalid encryption key", () => {
    expect(() => encryptValue("token", "too-short")).toThrow(/32-byte key/);
  });
});
