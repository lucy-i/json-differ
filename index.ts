import { Differ } from "./lib/differ";

export * from "./lib/differ";

// export async function myFunction() {
//     throw new Error('Not implemented');
// }

window["differ"] = Differ;
