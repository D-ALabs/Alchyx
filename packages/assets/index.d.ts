export type MarkName = "alchemist" | "flask" | "wordmark";
export type SkinName = "lab" | "dark" | "ark";

export declare const marks: readonly MarkName[];
export declare const skins: readonly SkinName[];

/** The `currentColor` master — inline it so it re-tints with `data-theme`. */
export declare function markUrl(mark: MarkName): URL;

/** A mark pinned to one skin's colour, for contexts `currentColor` cannot reach. */
export declare function skinUrl(mark: MarkName, skin: SkinName): URL;

/** The untouched originals the marks were drawn from. */
export declare function rasterUrl(file: string): URL;
