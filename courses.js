// ===== Saved courses =====
// Courses listed here show up on the "New Round" page, with pars and
// yardages filled in automatically for whichever tees you pick.
//
//   pars:     18 numbers, one per hole, front nine first.
//   hcps:     hole handicaps (stroke index) — not used by the app yet,
//             but saved for future net-scoring features.
//   yardages: 18 numbers matching those same holes.
//
// Source: Lake Merced Golf Club scorecard (rev. 5/24). Note: the card's
// printed IN subtotal for Tee III (2702) is a typo — its holes sum to 2704,
// which matches the card's own 5673 total.

const COURSES = [
  {
    name: "Lake Merced Golf Club",
    defaultTee: "Tee II", // preselected on the New Round page (until a different tee is used)
    pars: [4, 4, 3, 4, 4, 4, 3, 5, 5, 4, 4, 4, 3, 5, 4, 3, 4, 5],
    hcps: [5, 13, 17, 9, 7, 3, 11, 1, 15, 14, 10, 2, 18, 12, 6, 16, 4, 8],
    tees: [
      { name: "Plates",  rating: "74.3/142", yardages: [388, 377, 135, 380, 485, 423, 207, 628, 508, 317, 328, 476, 149, 538, 421, 180, 454, 539] },
      { name: "Tee I",   rating: "72.6/136", yardages: [388, 368, 125, 380, 369, 410, 201, 604, 508, 281, 319, 469, 149, 518, 416, 180, 372, 527] },
      { name: "Tee II",  rating: "70.8/132", yardages: [371, 332, 125, 366, 351, 382, 189, 583, 468, 255, 293, 456, 125, 492, 384, 148, 365, 503] },
      { name: "Tee III", rating: "68.2/129", yardages: [357, 315, 125, 346, 345, 348, 166, 508, 459, 241, 285, 310, 117, 450, 352, 132, 322, 495] },
      { name: "Tee IV",  rating: "64.0/115", yardages: [340, 239, 86, 203, 313, 297, 134, 458, 381, 208, 244, 310, 99, 405, 297, 113, 322, 416] },
    ],
  },
  {
    // Source: Stanford GC scorecard (10/2019). Pars/handicaps are the men's rows
    // (the card's women's row differs: holes 12 & 16 are par 5s, total 71).
    // White rating is the men's (69.1/123); the card also lists 74.2/133 for women.
    name: "Stanford Golf Course",
    defaultTee: "Black",
    pars: [5, 4, 3, 3, 4, 4, 5, 3, 4, 4, 4, 4, 4, 3, 4, 5, 3, 4],
    hcps: [13, 3, 9, 15, 5, 1, 11, 17, 7, 4, 14, 2, 6, 16, 12, 8, 18, 10],
    tees: [
      { name: "Cardinal", rating: "73.7/138", yardages: [520, 478, 214, 167, 444, 426, 536, 186, 364, 430, 360, 474, 437, 188, 363, 505, 196, 454] },
      { name: "Black",    rating: "71.0/131", yardages: [505, 418, 192, 143, 385, 403, 478, 145, 350, 401, 350, 442, 403, 160, 351, 492, 175, 420] },
      { name: "White",    rating: "69.1/123", yardages: [488, 382, 164, 120, 346, 386, 447, 130, 333, 376, 338, 425, 384, 136, 322, 442, 158, 394] },
      { name: "Blue",     rating: "71.7/130", yardages: [480, 348, 134, 101, 335, 324, 427, 117, 325, 338, 332, 403, 352, 117, 299, 431, 141, 359] },
    ],
  },
];

// ---- Lake Merced combo tees ----
// The club's combo cards play some holes from the longer tee set and the rest
// from the shorter one. Listed by hole number (1-18): the holes played from
// the LONGER tee. All three verified against the card's combo totals
// (6,393 / 5,936 / 5,246). Note: hole 14 on Combo II/III was inferred — the
// hole list David gave summed 42 yds short of the card's total, and hole 14
// is exactly 42 yds longer from Tee II than Tee III.
(() => {
  const lmgc = COURSES[0];
  const combo = (name, rating, longName, shortName, holesFromLong) => {
    const long = lmgc.tees.find((t) => t.name === longName).yardages;
    const short = lmgc.tees.find((t) => t.name === shortName).yardages;
    return { name, rating, yardages: long.map((y, i) => (holesFromLong.includes(i + 1) ? y : short[i])) };
  };
  lmgc.tees.push(
    combo("Combo I/II",   "71.8/134", "Tee I",   "Tee II", [1, 2, 3, 5, 10, 11, 13, 14, 16]),
    combo("Combo II/III", "69.7/131", "Tee II",  "Tee III", [2, 3, 4, 5, 11, 12, 13, 14, 16]),
    combo("Combo III/IV", "65.9/122", "Tee III", "Tee IV", [2, 3, 5, 9, 10, 11, 13, 14, 16]),
  );
  // Show tees longest-first in the picker
  const total = (t) => t.yardages.reduce((a, b) => a + b, 0);
  lmgc.tees.sort((a, b) => total(b) - total(a));
})();
