import { Readable } from "node:stream"
import { getLinesFromReadable } from "./utils"

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * Retrieving the lines from a Readable stream in TypeScript is "asynchronous", 
 * meaning that we can't just read the file and return its contents. 
 * You'll learn more about this in class. For now, just leave the 
 * "async" and "await" where they are. You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @returns a "promise" to produce a 2-d array of cell values
 */
export async function parseCSV(charSource: Readable): Promise<string[][]> {
  const lines = getLinesFromReadable(charSource) 

  // Create an empty array to hold the results
  let records: string[][] = []

  // We add the "await" here. 
  // We need to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  for await(const line of lines) {
      records.push(line.split(','))
  }
  return records 
}