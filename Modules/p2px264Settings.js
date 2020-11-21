const p2pSettings = [
  {
    name: "aq-mode",
    test: [
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --aq-mode 1 --output aq-mode-1.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --aq-mode 2 --output aq-mode-2.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --aq-mode 3 --output aq-mode-3.mkv - --ref --min-keyint  `,
    ],
  },
  {
    name: "aq-strength",
    test: [
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 0.5  --output aq-strengh-0.5.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 0.6  --output aq-strengh-0.6.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 0.7  --output aq-strengh-0.7.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 0.8  --output aq-strengh-0.8.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 0.9  --output aq-strengh-0.9.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 1 --output aq-strengh-1.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 1.1 --output aq-strengh-1.1.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 1.2 --output aq-strengh-1.2.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip  --aq-strength 1.3 --output aq-strengh-1.3.mkv - --ref --min-keyint  `,
    ],
  },
  {
    name: "deblock",
    test: [
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock -3:-3 --output deblock--3.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock -2:-2 --output deblock--2.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock -1:-1 --output deblock--1.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock 0:0 --output deblock-0.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock 1:1 --output deblock-1.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock 2:2 --output deblock-2.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --deblock 3:3 --output deblock-3.mkv - --ref --min-keyint  `,
    ],
  },
  {
    name: "qcomp",
    test: [
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --qcomp 0.6 --output qcomp-0.6.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --qcomp 0.7 --output qcomp-0.7.mkv - --ref --min-keyint  `,
      `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --qcomp 0.8 --output qcomp-0.8.mkv - --ref --min-keyint  `,
    ],
  },
];

for (const tests of p2pSettings) {
  const { name, test } = tests;
  console.log("name: ", name);
  for (const setting of test) {
    const fps = 24;
    const ref = 15;
    const newSetting = setting
      .replace("--min-keyint", `--min-keyint ${fps}`)
      .replace("--ref", `--ref ${ref}`);
    console.log(newSetting);
  }
}

// Note the process is

// Load up source -> crop -> filter -> test encodes to get variable x264 settings -> mux / set tracts -> upload template

// This should be BEFORE testing x264 values.

// debanded = core.f3kdb.Deband(resized,y=60,cb=60,cr=60,grainy=48,grainc=48,dynamic_grain=True,range=16)

// This assumes your cropped clip is called "resized"

// Have some mechanism to select this w/ GUI
//Anime only likes aq-mode 2

// Thats it.
// No need to test mode 1 or 3, it wants mode 2.

// `bin\\x264 --demuxer y4m --level 4.1 --b-adapt 2 --vbv-bufsize 78125 --vbv-maxrate 62500 --rc-lookahead 250  --me tesa --direct auto --subme 11 --trellis 2 --no-dct-decimate --no-fast-pskip --ref 16 - --min-keyint  `

// min-keyint [should typically be the frame rate of your video, e.g. if you were encoding 23.976fps content, then you use 24. This is setting the minimum distance between I-frames.]
// # 1080p=4, 720p=9, 576p=12, 480p=16`

// --qcomp [0.6 (default) to 0.8]
// --deblock [-3:-3 to 3:3]
// --aq-mode [1 to 3]
// --psy-rd [0.8 to 1.15:0 to 0.15]
// --aq-strength [0.5 to 1.3]
