import { describe, expect, test } from "vitest";
import * as fc from "fast-check";
import { parse as libraryParse } from "csv-parse/sync";
import { serializeCSV } from "../src/serialize";
import { buildTabularGenerator, csvChar } from "./test-helpers";
import { parseCSV } from "../src/parse";
import { toReadable } from "../src/utils";

/**
 * You'll eventually write these "arbitraries" (PBT generators) yourself. 
 * For sprint 1, keep it simple and just use ours. 
 */
const arbitraryTable = buildTabularGenerator({
  minValueLength: 0,
  maxValueLength: 20,
  chars: csvChar,
});
if(!(arbitraryTable instanceof fc.Arbitrary)) {
  throw new Error("Generator factory produced error, could not run the roundtrip test suite.")
}

//TODO: Write a Property-Based Test using your serializer, plus the parser and the generator we provide
