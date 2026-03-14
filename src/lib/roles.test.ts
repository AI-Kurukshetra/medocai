import { describe, expect, it } from "vitest";

import { roleLabels, roleLanding } from "./roles";

describe("roles", () => {
  it("maps each role to a landing route", () => {
    expect(roleLanding.physician).toBe("/physician");
    expect(roleLanding.cdi).toBe("/cdi");
    expect(roleLanding.coder).toBe("/coder");
    expect(roleLanding.admin).toBe("/templates");
  });

  it("maps each role to a human label", () => {
    expect(roleLabels.physician).toBe("Physician");
    expect(roleLabels.cdi).toBe("CDI Specialist");
    expect(roleLabels.coder).toBe("Coder");
    expect(roleLabels.admin).toBe("Admin");
  });
});
