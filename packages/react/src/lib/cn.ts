/**
 * cn — tiny className combiner (a dependency-free clsx). Accepts strings,
 * numbers, arrays, and `{ "class": boolean }` objects; drops falsy values.
 * Alchyx components style themselves with `alx-*` classes and merge a
 * user-supplied `className` on top, so consumers can layer Tailwind utilities
 * (via the @alchyx/tokens preset) or their own classes freely.
 */
export type ClassValue =
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

export function cn(...inputs: ClassValue[]): string {
  let out = "";
  for (const input of inputs) {
    if (!input) continue;
    const type = typeof input;
    if (type === "string" || type === "number" || type === "bigint") {
      out += (out && " ") + input;
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) out += (out && " ") + inner;
    } else if (type === "object") {
      for (const key in input as Record<string, unknown>) {
        if ((input as Record<string, unknown>)[key]) {
          out += (out && " ") + key;
        }
      }
    }
  }
  return out;
}
