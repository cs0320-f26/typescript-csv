import * as fc from "fast-check";

/*
  Helpers for fast-check, to be provided with Sprint 1.

  Note: JSDoc comments contain teaching comments, which makes them longer than 
  usual: when writing your own code, try to keep these concise (while giving 
  as much information as a caller needs to understand the contract between your 
  code and them).

  I made some mistakes when I initially wrote this! Want to know what they were?
  Scroll to the end to see them.
*/

/**
 * Generator for a single ASCII character, biased toward the characters that
 * CSV-parsing cares about to increase the chance of finding an issue. The
 * probability of each option is optionWeight / sumOfAllOptionWeights.
 *
 * The unit parameter to fc.string controls which characters can appear: here we
 * want printable ASCII characters: 'grapheme-ascii'.
 *
 * Note: the fast-check library calls generators "arbitraries", hence the type.
 */
export const csvChar: fc.Arbitrary<string> = fc.oneof(
  {
    weight: 8,
    arbitrary: fc.string({
      unit: "grapheme-ascii",
      minLength: 1,
      maxLength: 1,
    }),
  },
  { weight: 1, arbitrary: fc.constant(",") },
  { weight: 1, arbitrary: fc.constant('"') },
);

/**
 * The buildTabularGenerator function below is a _factory function_: it
 * manufactures a string[][] generator that obeys the argument values the caller
 * gives. This interface is just a convenient way to define the shape of the
 * arguments that the factory expects.
 *
 * Appending ? to a name in an interface means "optional": if not provided, it
 * will default to the value undefined. Here, that would mean to use whatever
 * default the fast-check library sets.
 */
export interface RandomTableParameters {
  minRows?: number;
  maxRows?: number;
  minCols?: number;
  maxCols?: number;
  minValueLength?: number;
  maxValueLength?: number;
  chars: fc.Arbitrary<string>;
}

/**
 * A structured error response, in case the factory can't build the requested
 * arbitrary. It includes the arguments that the factory was given to aid
 * debugging.
 *
 * This is _NOT_ an exception! It is a normal value.
 */
export interface RandomTableInvalidArguments {
  error:
    | "minCols"
    | "minRows"
    | "maxCols"
    | "maxRows"
    | "minValueLength"
    | "maxValueLength";
  args: RandomTableParameters;
}

/**
 * Build a fast-check arbitrary for string[][] values.
 *
 * Note: the validation at the start of this function is rather long, isn't it?
 * We'll learn a more concise way to do this soon.
 *
 * @param args Configuration options for building the arbitrary
 * @returns A fast-check arbitrary for string[][] values OR a failure object if
 *   the parameters are invalid.
 */
export function buildTabularGenerator(
  args: RandomTableParameters,
): fc.Arbitrary<string[][]> | RandomTableInvalidArguments {
  // Destructure the input object: this lets us provide defaults if the caller
  // omitted values for any numeric parameter.
  const {
    minRows = 0,
    maxRows = 8,
    minCols = 1,
    maxCols = 8,
    minValueLength = 0,
    maxValueLength = 20,
    chars,
  } = args;

  // Argument validation. This seems like so much work to write! and I even made
  // mistakes when I initially wrote this! We'll do validation better soon.
  if (minCols < 1) return { error: "minCols", args: args };
  if (minRows < 0) return { error: "minRows", args: args };
  if (maxCols < 1) return { error: "maxCols", args: args };
  if (maxRows < 0) return { error: "maxRows", args: args };
  if (minValueLength < 0) return { error: "minValueLength", args: args };
  if (maxValueLength < 0) return { error: "maxValueLength", args: args };

  // The fast-check library
  return (
    fc
      // Generate: a tuple (i.e., an array of fixed length and types). We've given
      // 2 number-generating arguments here, so the tuples will be pairs of numbers.
      .tuple(
        fc.integer({ min: minRows, max: maxRows }),
        fc.integer({ min: minCols, max: maxCols }),
      )
      // Chain: given an arbitrary tuple, use it to configure more random generation.
      // The "rows" and "cols" variables here are actual values, not arbitraries.
      .chain(([rows, cols]) =>
        // Generate: a (row x col) array of arrays
        fc.array(
          fc.array(
            // Generate: (row*col) strings to populate the array
            fc.string({
              unit: chars,
              minLength: minValueLength,
              maxLength: maxValueLength,
            }),
            {
              minLength: cols,
              maxLength: cols,
            },
          ),
          { minLength: rows, maxLength: rows },
        ),
      )
  );
}

/*
  What mistakes did I make when I wrote this? 

  (1) If the caller provided no value for a parameter, I left it undefined and let 
      fast-check's default behavior happen. But fast-check's default for numbers includes 
      negative numbers, which make very bad lengths. So I added the more narrow defaults.

  (2) Before I fixed (1), each validation if-then needed to check that a value was there before 
      using < on it. I originally wrote this:
          if (minCols && minCols < 1) return { error: "minCols", args: args };
      But this isn't safe in TypeScript: the numeric value 0 is "falsey". It will
      be invisibly converted to false when the && gets evaluated. I needed to write:
          if (minCols !== undefined && minCols < 1) return { error: "minCols", args: args };
      After I fixed (1), this went way entirely.

  (3) I got one of the error labels wrong. I accidentally left
          return { error: "minValueLength", args: args };
      when I really meant
          return { error: "maxValueLength", args: args };
   
  All 3 of these were caught by a quick agentic review. The changes were narrow: the overall
  design, documentation, and teaching comments remained the same. 

  Interestingly, my own serializer solution had an error that was caught by PBT. :-)

*/
