import { createAuth } from "./src/auth";

// Used only for schema generation — stub values, not production
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = createAuth({} as any, "stub-secret", "http://localhost:8787");
