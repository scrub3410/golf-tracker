// A pre-filled demo round (82 at Lake Merced from Tee II) shown the first time
// the app opens on a new device, so the scorecard, shot trackers, and analytics
// have something to show. Deleting it in the app won't bring it back.

const EXAMPLE_ROUND = {
  "id": "example-round",
  "course": "Lake Merced GC (Example)",
  "date": "2026-07-18",
  "tee": "Tee II",
  "startHole": 1,
  "holes": [
    {
      "par": 4,
      "yards": 371,
      "fir": true,
      "tee": {
        "x": 120,
        "y": 130
      },
      "approach": "145",
      "shot": {
        "x": 170,
        "y": 148
      },
      "gir": true,
      "upDown": false,
      "putts": 2,
      "score": 4,
      "notes": "Solid start — 8 iron to 17 ft.",
      "club": "8i"
    },
    {
      "par": 4,
      "yards": 332,
      "fir": false,
      "tee": {
        "x": 30,
        "y": 140
      },
      "approach": "150",
      "shot": {
        "x": 195,
        "y": 215
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 6,
      "notes": "Plugged lie in the bunker, hacked out.",
      "club": "8i"
    },
    {
      "par": 3,
      "yards": 125,
      "fir": false,
      "tee": null,
      "approach": "125",
      "shot": {
        "x": 50,
        "y": 150
      },
      "gir": true,
      "upDown": false,
      "putts": 3,
      "score": 4,
      "notes": "",
      "club": "9i"
    },
    {
      "par": 4,
      "yards": 366,
      "fir": true,
      "tee": {
        "x": 125,
        "y": 145
      },
      "approach": "160",
      "shot": {
        "x": 120,
        "y": 235
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 5,
      "notes": "",
      "club": "7i"
    },
    {
      "par": 4,
      "yards": 351,
      "fir": false,
      "tee": {
        "x": 210,
        "y": 150
      },
      "approach": "155",
      "shot": {
        "x": 50,
        "y": 70
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 5,
      "notes": "",
      "club": "7i"
    },
    {
      "par": 4,
      "yards": 382,
      "fir": true,
      "tee": {
        "x": 110,
        "y": 120
      },
      "approach": "170",
      "shot": {
        "x": 120,
        "y": 42
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 5,
      "notes": "",
      "club": "6i"
    },
    {
      "par": 3,
      "yards": 189,
      "fir": false,
      "tee": null,
      "approach": "189",
      "shot": {
        "x": 120,
        "y": 30
      },
      "gir": false,
      "upDown": true,
      "putts": 1,
      "score": 3,
      "notes": "Up & down from the back bunker. Sandy!",
      "club": "4i"
    },
    {
      "par": 5,
      "yards": 583,
      "fir": true,
      "tee": {
        "x": 130,
        "y": 135
      },
      "approach": "90",
      "shot": {
        "x": 60,
        "y": 210
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 6,
      "notes": "",
      "club": "SW"
    },
    {
      "par": 5,
      "yards": 468,
      "fir": false,
      "tee": {
        "x": 30,
        "y": 170
      },
      "approach": "95",
      "shot": {
        "x": 135,
        "y": 128
      },
      "gir": true,
      "upDown": false,
      "putts": 1,
      "score": 4,
      "notes": "Birdie — wedge to 6 ft.",
      "club": "GW"
    },
    {
      "par": 4,
      "yards": 255,
      "fir": false,
      "tee": {
        "x": 205,
        "y": 150
      },
      "approach": "70",
      "shot": {
        "x": 110,
        "y": 235
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 5,
      "notes": "",
      "club": "SW"
    },
    {
      "par": 4,
      "yards": 293,
      "fir": true,
      "tee": {
        "x": 115,
        "y": 150
      },
      "approach": "95",
      "shot": {
        "x": 95,
        "y": 160
      },
      "gir": true,
      "upDown": false,
      "putts": 2,
      "score": 4,
      "notes": "",
      "club": "GW"
    },
    {
      "par": 4,
      "yards": 456,
      "fir": true,
      "tee": {
        "x": 130,
        "y": 160
      },
      "approach": "190",
      "shot": {
        "x": 120,
        "y": 236
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 5,
      "notes": "This hole is a par 5 for me.",
      "club": "5i"
    },
    {
      "par": 3,
      "yards": 125,
      "fir": false,
      "tee": null,
      "approach": "125",
      "shot": {
        "x": 190,
        "y": 200
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 4,
      "notes": "",
      "club": "9i"
    },
    {
      "par": 5,
      "yards": 492,
      "fir": false,
      "tee": {
        "x": 35,
        "y": 160
      },
      "approach": "100",
      "shot": {
        "x": 120,
        "y": 60
      },
      "gir": true,
      "upDown": false,
      "putts": 3,
      "score": 6,
      "notes": "Three-jacked from 27 ft. Ugh.",
      "club": "PW"
    },
    {
      "par": 4,
      "yards": 384,
      "fir": true,
      "tee": {
        "x": 125,
        "y": 125
      },
      "approach": "165",
      "shot": {
        "x": 235,
        "y": 150
      },
      "gir": false,
      "upDown": false,
      "putts": 2,
      "score": 5,
      "notes": "",
      "club": "6i"
    },
    {
      "par": 3,
      "yards": 148,
      "fir": false,
      "tee": null,
      "approach": "148",
      "shot": {
        "x": 128,
        "y": 150
      },
      "gir": true,
      "upDown": false,
      "putts": 1,
      "score": 2,
      "notes": "Stuffed it to 4 ft. Birdie!",
      "club": "8i"
    },
    {
      "par": 4,
      "yards": 365,
      "fir": false,
      "tee": {
        "x": 208,
        "y": 155
      },
      "approach": "140",
      "shot": {
        "x": 230,
        "y": 140
      },
      "gir": false,
      "upDown": true,
      "putts": 1,
      "score": 4,
      "notes": "Best sand save of the year.",
      "club": "9i"
    },
    {
      "par": 5,
      "yards": 503,
      "fir": true,
      "tee": {
        "x": 110,
        "y": 140
      },
      "approach": "110",
      "shot": {
        "x": 120,
        "y": 232
      },
      "gir": false,
      "upDown": true,
      "putts": 1,
      "score": 5,
      "notes": "Chip and a putt to finish.",
      "club": "PW"
    }
  ]
};
