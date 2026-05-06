// Kindergarten Reading & Spelling — 32 week sequence
// Built around structured phonics; assumes letter sounds are mastered.

window.CURRICULUM = [
  // ─────────── UNIT 1 — Consonant Digraphs ───────────
  {
    week: 1,
    unit: "Consonant Digraphs",
    reading: {
      focus: "sh",
      title: "The /sh/ digraph",
      summary: "Two letters, one quiet sound. The 'be quiet' sound.",
      words: ["ship", "shop", "fish", "wish", "shell", "cash", "dash", "rush"],
      sentence: "The fish in the shop is fresh.",
      activity: {
        kind: "Game",
        name: "Shhh Hunt",
        body: "Whisper a word. If it has /sh/, child tiptoes one step forward; if not, they freeze. Reach the wall and they pick the next word."
      },
      song: "To 'Twinkle Twinkle': S-H says shhh, S-H says shhh, like a whisper soft and slow / Ship and shop and fish and wish, S-H says shhh, now you know.",
      prereqs: ["All single letter sounds", "Blending 3-sound CVC words"],
      mistakes: ["Saying both letters separately (s-h instead of sh)", "Confusing 'sh' with 'ch'"],
      check: "Can the child read 6 of these unprompted? ship, shop, fish, dish, rash, hush"
    },
    spelling: {
      focus: "sh words + Dolch: the, of",
      pattern: "Spell /sh/ at start and end of CVC words.",
      words: ["ship", "shop", "fish", "dish", "rash", "hush"],
      sightWords: ["the", "of"],
      sentence: "I see the fish in the shop.",
      activity: {
        kind: "Movement",
        name: "Sky-Write Shhh",
        body: "Child traces 's-h' in the air with a big arm sweep while whispering /sh/. Then write the word on paper. Air-write engages large motor memory."
      },
      mistakes: ["Writing 'sh' as 'ch'", "Forgetting the silent letter pairing"],
      check: "Dictate 4 words: ship, fish, shop, hush. 3 of 4 correct = pass."
    }
  },
  {
    week: 2,
    unit: "Consonant Digraphs",
    reading: {
      focus: "ch",
      title: "The /ch/ digraph",
      summary: "The train sound — chug chug chug.",
      words: ["chip", "chop", "chin", "much", "such", "rich", "bench", "lunch"],
      sentence: "Mom packed a chip and a peach for lunch.",
      activity: {
        kind: "Game",
        name: "Choo-Choo Train",
        body: "Make a train with arms. Each /ch/ word said correctly = one chug forward. Take turns being the conductor calling words."
      },
      song: "Chant: 'Ch-ch-ch like a choo-choo train, chip and chop and chin again!' Clap on each /ch/.",
      prereqs: ["Mastery of /sh/", "Blending CVC + digraph"],
      mistakes: ["Saying /sh/ instead of /ch/ (mouth shape is different — teeth touch for ch)", "Substituting /j/"],
      check: "Read 6: chip, chop, chin, rich, much, bench."
    },
    spelling: {
      focus: "ch words + Dolch: and, a",
      pattern: "Spell /ch/ at start and end. -tch comes later.",
      words: ["chip", "chop", "chin", "much", "such", "rich"],
      sightWords: ["and", "a"],
      sentence: "I had a chip and a chop.",
      activity: {
        kind: "Movement",
        name: "Stomp & Spell",
        body: "Stomp foot on each letter while saying it: STOMP-c, STOMP-h, STOMP-i, STOMP-p. Big body movements lock in spelling."
      },
      mistakes: ["Writing 'sh' for /ch/", "Adding extra letters"],
      check: "Dictate: chip, much, chop, rich. 3 of 4 = pass."
    }
  },
  {
    week: 3,
    unit: "Consonant Digraphs",
    reading: {
      focus: "th (voiced & unvoiced)",
      title: "Two flavors of /th/",
      summary: "Tongue between teeth. Soft (think) and buzzy (this).",
      words: ["this", "that", "then", "them", "thin", "thick", "with", "bath", "math", "path"],
      sentence: "That thin path goes to the bath.",
      activity: {
        kind: "Game",
        name: "Tongue Check",
        body: "Hold a small mirror or just watch each other. Stick tongue between teeth and say each word — confirm tongue is in the right spot. Silly faces encouraged."
      },
      song: "To 'Row Row Row': Th-th-th between your teeth, this and that and then / Thin and thick and bath and math, say them all again.",
      prereqs: ["/sh/ and /ch/ mastery"],
      mistakes: ["Substituting /f/ (fink for think) or /d/ (dis for this)", "Not protruding tongue"],
      check: "Read 6: this, that, thin, with, bath, path."
    },
    spelling: {
      focus: "th words + Dolch: to, in, is",
      pattern: "Spell /th/ at start and end.",
      words: ["this", "that", "thin", "with", "bath", "math"],
      sightWords: ["to", "in", "is"],
      sentence: "This is a math path.",
      activity: {
        kind: "Hands-on",
        name: "Finger Tap",
        body: "Tap thumb to fingers as you say each sound: th (1 tap), i (1 tap), n (1 tap) = thin. Three taps = three sounds, even though we wrote four letters. Teaches that th = one sound."
      },
      mistakes: ["Writing 'f' for /th/", "Writing only one letter"],
      check: "Dictate: this, that, thin, bath. 3 of 4 = pass."
    }
  },
  {
    week: 4,
    unit: "Consonant Digraphs",
    reading: {
      focus: "wh, ph, ck",
      title: "The rest of the digraphs",
      summary: "wh = /w/ in most words. ph = /f/ (rare). ck = /k/ after a short vowel.",
      words: ["when", "what", "whip", "phone", "graph", "back", "duck", "rock", "pick", "lock"],
      sentence: "When the duck pecks the rock, pick it up.",
      activity: {
        kind: "Game",
        name: "Question Words Hop",
        body: "Tape four 'wh' words to the floor (when, what, where, who). Call out a question and child hops to the answer word. 'When do we eat?' → hop to 'when'."
      },
      song: "Sticky-K rule chant: 'After a short vowel, c-k is the team — duck, back, rock, lock, pick, sock, kick!'",
      prereqs: ["sh, ch, th"],
      mistakes: ["Spelling /k/ at end with just 'k' after short vowel (bak instead of back)", "Reading 'ph' as /p/+/h/"],
      check: "Read 6: when, what, back, duck, rock, lock."
    },
    spelling: {
      focus: "wh & ck + Dolch: it, you, that",
      pattern: "Sticky-K rule: after a short vowel at the end of a 1-syllable word, use ck.",
      words: ["when", "what", "back", "duck", "rock", "pick"],
      sightWords: ["it", "you", "that"],
      sentence: "You can pick that rock.",
      activity: {
        kind: "Movement",
        name: "Sticky-K Stick",
        body: "When child hears a short-vowel-then-/k/ word, they stick their hands together (sticky!) before writing 'ck'. If long vowel or two consonants before, hands stay apart for plain 'k'."
      },
      mistakes: ["Using 'k' instead of 'ck' after short vowel", "Forgetting the 'h' in 'wh'"],
      check: "Dictate: back, duck, when, pick. 3 of 4 = pass."
    }
  },

  // ─────────── UNIT 2 — Blends & Glued Sounds ───────────
  {
    week: 5,
    unit: "Blends & Endings",
    reading: {
      focus: "Beginning blends: bl, cl, fl, gl, pl, sl",
      title: "L-blends",
      summary: "Two consonants, two sounds — say them fast and smooth.",
      words: ["black", "clap", "flag", "glad", "plan", "slip", "blue", "clip", "flat", "slim"],
      sentence: "The flag is black and blue.",
      activity: {
        kind: "Game",
        name: "Blend Slide",
        body: "Slide a finger across the two consonants (b—l) saying each sound, then slide faster and faster until they blur together. Then add the rest of the word."
      },
      song: "To 'Mary Had a Little Lamb': bl, cl, fl, gl, pl, sl / pl and sl / pl and sl. L-blends like to stick together, say them quick and tight.",
      prereqs: ["All digraphs"],
      mistakes: ["Dropping the second consonant (bak for black)", "Inserting a vowel between (buh-lack)"],
      check: "Read 6 mixed blends: clap, flag, slip, plan, glad, black."
    },
    spelling: {
      focus: "L-blends + Dolch: he, was, for",
      pattern: "Hear both consonants — write both.",
      words: ["clap", "flag", "slip", "plan", "glad", "black"],
      sightWords: ["he", "was", "for"],
      sentence: "He was glad for the flag.",
      activity: {
        kind: "Hands-on",
        name: "Two-Finger Tap",
        body: "Tap two fingers together for the blend (cl), then one finger per remaining sound. Counts the sounds you must write."
      },
      mistakes: ["Missing the second blend letter"],
      check: "Dictate 4 blend words. 3 of 4 = pass."
    }
  },
  {
    week: 6,
    unit: "Blends & Endings",
    reading: {
      focus: "Beginning blends: br, cr, dr, fr, gr, pr, tr",
      title: "R-blends",
      summary: "R is loud — pair it with another consonant and zip them together.",
      words: ["brick", "crab", "drum", "frog", "grin", "prop", "truck", "trip", "drip", "grab"],
      sentence: "The frog sat on a brick by the truck.",
      activity: {
        kind: "Movement",
        name: "Drum & Drip",
        body: "Pat knees like a drum on each blend word. 'DRum' (pat-pat), 'TRip' (pat-pat). Movement marks the two-sound start."
      },
      song: "Chant: 'br cr dr fr gr pr tr — r is loud, hear it ROAR!' Make a roar after each pair.",
      prereqs: ["L-blends"],
      mistakes: ["Saying only the r-sound", "Adding an /uh/ (buh-rick)"],
      check: "Read 6: brick, crab, frog, grin, trip, drum."
    },
    spelling: {
      focus: "R-blends + Dolch: on, are, with",
      pattern: "Two consonants, two letters.",
      words: ["brick", "crab", "frog", "grin", "trip", "drum"],
      sightWords: ["on", "are", "with"],
      sentence: "Are you on the trip with the frog?",
      activity: {
        kind: "Game",
        name: "Sound Boxes",
        body: "Draw 4 boxes. Push a small object (penny, bean) into each box for each sound: b-r-i-ck = 4 boxes, 4 pushes. Then write the letters in the boxes."
      },
      mistakes: ["Reversing the blend (rb for br)"],
      check: "Dictate: trip, frog, brick, grin. 3 of 4 = pass."
    }
  },
  {
    week: 7,
    unit: "Blends & Endings",
    reading: {
      focus: "S-blends: sk, sl, sm, sn, sp, st, sw",
      title: "S-blends",
      summary: "S leads the way. Hiss into the next sound.",
      words: ["skip", "sled", "smell", "snap", "spin", "stop", "swim", "stamp", "spell", "slid"],
      sentence: "Stop and smell the snap of the swing.",
      activity: {
        kind: "Game",
        name: "Snake Slither",
        body: "Slither on the floor while hissing 'ssss' into each blend word. 'sssssskip!' 'ssssstop!' Big body engages memory."
      },
      song: "To 'Wheels on the Bus': The s-blends slither all around, all around, all around / sk and sl and sm and sn, all around the page.",
      prereqs: ["L-blends, R-blends"],
      mistakes: ["Treating s as a separate syllable"],
      check: "Read 6: skip, snap, stop, swim, smell, spin."
    },
    spelling: {
      focus: "S-blends + Dolch: as, his, they",
      pattern: "S + consonant.",
      words: ["skip", "snap", "stop", "swim", "smell", "spin"],
      sightWords: ["as", "his", "they"],
      sentence: "They swim as his frog can.",
      activity: {
        kind: "Movement",
        name: "Letter Yoga",
        body: "Make S-shape with body (curve like a snake), then make the next letter (T = arms out, P = one arm down). Form each blend with two bodies if you have two children."
      },
      mistakes: ["Dropping the s"],
      check: "Dictate: stop, swim, snap, spin. 3 of 4 = pass."
    }
  },
  {
    week: 8,
    unit: "Blends & Endings",
    reading: {
      focus: "Glued endings: -ang, -ing, -ong, -ung, -ank, -ink, -onk, -unk",
      title: "Glued endings (welded sounds)",
      summary: "These letters stick together — say them as one chunk, don't sound them out.",
      words: ["sang", "ring", "song", "rung", "bank", "pink", "honk", "junk", "thing", "sink"],
      sentence: "The pink thing sank in the sink.",
      activity: {
        kind: "Game",
        name: "Glue Stick Chant",
        body: "Pretend to squeeze glue on the ending: 'gluuuue... -ank!' Then add the beginning: 'b-ank... bank!' Treat the chunk as ONE piece."
      },
      song: "To 'Old MacDonald': And on this farm we had some -INKs, e-i-e-i-o / With a pink-pink here and a sink-sink there...",
      prereqs: ["All blends and digraphs"],
      mistakes: ["Trying to sound out each letter (s-i-n-k instead of s + ink)", "Confusing -ing and -ink"],
      check: "Read 6: sang, ring, bank, pink, junk, thing."
    },
    spelling: {
      focus: "Glued endings + Dolch: have, from",
      pattern: "Treat -ank, -ink, -unk, -ing as units. Don't break them apart.",
      words: ["sang", "ring", "bank", "pink", "junk", "sink"],
      sightWords: ["have", "from"],
      sentence: "I have a pink ring from mom.",
      activity: {
        kind: "Hands-on",
        name: "Chunk Cards",
        body: "Write -ank, -ink, -unk, -ing on index cards. Say a beginning sound (b, p, j) and child slaps the matching ending card to make a word."
      },
      mistakes: ["Writing -ig instead of -ing", "Mixing -ank and -ang"],
      check: "Dictate: bank, ring, junk, pink. 3 of 4 = pass."
    }
  },

  // ─────────── UNIT 3 — Long Vowels & Silent E ───────────
  {
    week: 9,
    unit: "Silent E (VCe)",
    reading: {
      focus: "a_e (cake, made)",
      title: "Magic E with A",
      summary: "Silent E at the end makes the vowel say its name.",
      words: ["cake", "made", "name", "game", "late", "save", "tape", "bake", "lake", "snake"],
      sentence: "I made a cake by the lake.",
      activity: {
        kind: "Game",
        name: "Magic E Wand",
        body: "Use a pencil as a wand. Write 'cap'. Tap the wand and add 'e' — child reads 'cape!'. Try mad/made, hat/hate, tap/tape. The wand makes the magic real."
      },
      song: "To 'BINGO': There was a vowel and E was magic / and silent E was its name-o / S-I-L-E-N-T, makes A say its name!",
      prereqs: ["Short vowel CVC mastery"],
      mistakes: ["Reading the silent E", "Not lengthening the vowel"],
      check: "Read 6: cake, made, name, late, lake, snake."
    },
    spelling: {
      focus: "a_e + Dolch: said, like, do",
      pattern: "Long A at end of syllable → write a_e.",
      words: ["cake", "made", "name", "late", "lake", "snake"],
      sightWords: ["said", "like", "do"],
      sentence: "I like the cake mom made.",
      activity: {
        kind: "Movement",
        name: "Stretch the Vowel",
        body: "Pull hands apart while saying the long vowel: 'caaaaake'. The stretch reminds them to add silent E."
      },
      mistakes: ["Forgetting silent E", "Doubling the vowel (caak)"],
      check: "Dictate: cake, made, lake, name. 3 of 4 = pass."
    }
  },
  {
    week: 10,
    unit: "Silent E (VCe)",
    reading: {
      focus: "i_e (bike, time)",
      title: "Magic E with I",
      summary: "Silent E makes I say its name.",
      words: ["bike", "time", "ride", "kite", "side", "five", "line", "nice", "ice", "white"],
      sentence: "I will ride my bike five times.",
      activity: {
        kind: "Game",
        name: "Bike Ride",
        body: "Pretend to ride a bike (lying on back, feet up, pedal). Each i_e word said correctly = 5 pedals. Builds rhythm."
      },
      song: "Continue Magic E song with I: 'makes I say its name!'",
      prereqs: ["a_e mastery"],
      mistakes: ["Reading short i instead of long i"],
      check: "Read 6: bike, time, ride, kite, five, white."
    },
    spelling: {
      focus: "i_e + Dolch: my, me, by",
      pattern: "Long I → i_e.",
      words: ["bike", "time", "ride", "kite", "five", "nice"],
      sightWords: ["my", "me", "by"],
      sentence: "My bike is by me.",
      activity: {
        kind: "Hands-on",
        name: "Sliding Letters",
        body: "Write 'rid' on three slips of paper. Slide an 'e' card to the right of them. Read 'ride'. Take it away — read 'rid'. Visual switch."
      },
      mistakes: ["Doubling i (riid)"],
      check: "Dictate: bike, time, ride, five. 3 of 4 = pass."
    }
  },
  {
    week: 11,
    unit: "Silent E (VCe)",
    reading: {
      focus: "o_e (home, bone)",
      title: "Magic E with O",
      summary: "Silent E makes O say its name.",
      words: ["home", "bone", "rope", "note", "hope", "rose", "stone", "joke", "nose", "those"],
      sentence: "I hope the dog finds the bone at home.",
      activity: {
        kind: "Game",
        name: "Phone Home",
        body: "Pretend hand is a phone. 'Call' a long-O word and child answers: ring-ring... 'home!'. Practice articulation and rhyming."
      },
      song: "Continue Magic E song: 'makes O say its name!'",
      prereqs: ["a_e, i_e"],
      mistakes: ["Short o intrusion"],
      check: "Read 6: home, bone, rope, hope, nose, joke."
    },
    spelling: {
      focus: "o_e + Dolch: go, no, so",
      pattern: "Long O → o_e.",
      words: ["home", "bone", "rope", "hope", "nose", "joke"],
      sightWords: ["go", "no", "so"],
      sentence: "I go home so no one is alone.",
      activity: {
        kind: "Movement",
        name: "Long-O Yawn",
        body: "Yawn loudly: 'oooooh'. Stretch arms wide. Each yawn = one long O word to spell. Silly + memorable."
      },
      mistakes: ["Writing 'oa' or 'ow' instead of o_e"],
      check: "Dictate: home, bone, hope, joke. 3 of 4 = pass."
    }
  },
  {
    week: 12,
    unit: "Silent E (VCe)",
    reading: {
      focus: "u_e (cube, mule) and e_e (these, here)",
      title: "Magic E with U and E",
      summary: "U_e is rarer; e_e is rarest. Quick coverage.",
      words: ["cube", "mule", "cute", "tune", "use", "these", "here", "fume", "rude", "huge"],
      sentence: "These cute cubes are huge.",
      activity: {
        kind: "Game",
        name: "Magic E Showdown",
        body: "Mix all silent-E words from past 4 weeks face down. Flip two — read both — keep if you read correctly. Memory + review."
      },
      song: "Recap full Magic E song with all 5 vowels.",
      prereqs: ["a_e, i_e, o_e"],
      mistakes: ["U has two long sounds (you vs oo) — both are okay"],
      check: "Read 6: cube, cute, use, tune, these, here."
    },
    spelling: {
      focus: "u_e/e_e + Dolch: we, see, here",
      pattern: "Long U → u_e. Long E → usually ee, sometimes e_e.",
      words: ["cube", "cute", "use", "tune", "these", "here"],
      sightWords: ["we", "see", "here"],
      sentence: "We see these cute cubes here.",
      activity: {
        kind: "Hands-on",
        name: "Word Sort",
        body: "Sort 20 mixed silent-E words into 4 piles by vowel: a_e / i_e / o_e / u_e. Use index cards on the floor."
      },
      mistakes: ["Mixing u_e with oo"],
      check: "Dictate: cube, use, these, here. 3 of 4 = pass."
    }
  },

  // ─────────── UNIT 4 — Vowel Teams ───────────
  {
    week: 13,
    unit: "Vowel Teams",
    reading: {
      focus: "ee (see, tree)",
      title: "Two E's = long E",
      summary: "When two vowels go walking, the first does the talking.",
      words: ["see", "tree", "bee", "feet", "green", "sleep", "week", "feel", "need", "keep"],
      sentence: "I need to sleep for a week in the green tree.",
      activity: {
        kind: "Game",
        name: "Bee Buzz",
        body: "Buzz like a bee: 'bzzzz-EEE!' on each ee word. Fly around the room landing on objects. Two-vowel walking talk."
      },
      song: "To 'Twinkle Twinkle': When two vowels go a-walking / The first one does the talking / E and E say long E's name / See and tree and bee the same.",
      prereqs: ["Silent E mastery"],
      mistakes: ["Confusing ee with ea (similar sound, different spelling)"],
      check: "Read 6: see, tree, feet, sleep, green, week."
    },
    spelling: {
      focus: "ee + Dolch: she, be, three",
      pattern: "Long E in middle of word → often ee.",
      words: ["see", "tree", "feet", "sleep", "green", "week"],
      sightWords: ["she", "be", "three"],
      sentence: "She can see three green trees.",
      activity: {
        kind: "Movement",
        name: "Double-E Jump",
        body: "Two jumps for the two E's. Say 'eeee' on each jump. Body remembers the doubled letter."
      },
      mistakes: ["Single e (se for see)"],
      check: "Dictate: see, tree, feet, green. 3 of 4 = pass."
    }
  },
  {
    week: 14,
    unit: "Vowel Teams",
    reading: {
      focus: "ea (eat, read)",
      title: "EA — also long E",
      summary: "Same long E sound as ee, different spelling. Many common words.",
      words: ["eat", "read", "sea", "tea", "leaf", "team", "beach", "dream", "clean", "meal"],
      sentence: "I eat a clean meal by the sea.",
      activity: {
        kind: "Game",
        name: "EE or EA?",
        body: "Say a long-E word. Child holds up 2 fingers for ee or makes an A-shape for ea, then writes it. Builds spelling intuition through repetition."
      },
      song: "Add to walking song: 'E and A go walking too / first one talks, that's E for you!'",
      prereqs: ["ee mastery"],
      mistakes: ["Reading ea as short e (this happens in some words like 'bread' — that's a Heart Word for now)"],
      check: "Read 6: eat, read, sea, beach, dream, team."
    },
    spelling: {
      focus: "ea + Dolch: come, look, what",
      pattern: "Long E → sometimes ea (you'll learn which through reading lots).",
      words: ["eat", "read", "sea", "beach", "dream", "team"],
      sightWords: ["come", "look", "what"],
      sentence: "Come look at what I read.",
      activity: {
        kind: "Hands-on",
        name: "Word Family Tree",
        body: "Draw a tree. ee on left branches, ea on right. Add words as you find them in books over the week. Visual collection."
      },
      mistakes: ["Writing ee for ea words"],
      check: "Dictate: eat, sea, dream, beach. 3 of 4 = pass."
    }
  },
  {
    week: 15,
    unit: "Vowel Teams",
    reading: {
      focus: "ai (rain, mail)",
      title: "AI — long A in the middle",
      summary: "AI works in the middle of a word, never at the end.",
      words: ["rain", "mail", "tail", "pain", "wait", "train", "paint", "sail", "snail", "main"],
      sentence: "Wait for the train in the rain.",
      activity: {
        kind: "Game",
        name: "Rainstorm",
        body: "Tap fingers on table starting slow, then faster — make a rainstorm. Read an 'ai' word with each louder thunder clap. Whole-body rhythm."
      },
      song: "To 'Rain Rain Go Away': A-I says long A / In the middle of the way / Rain and mail and tail and wait / A-I helps us read just great.",
      prereqs: ["ee, ea"],
      mistakes: ["Using ai at end of word (use ay instead)"],
      check: "Read 6: rain, mail, tail, train, paint, wait."
    },
    spelling: {
      focus: "ai + Dolch: get, away, this",
      pattern: "Long A in middle of word → ai.",
      words: ["rain", "mail", "tail", "train", "paint", "wait"],
      sightWords: ["get", "away", "this"],
      sentence: "Get this mail away from the rain.",
      activity: {
        kind: "Movement",
        name: "Choo-Choo Spelling",
        body: "March in a line saying the letters of 'train': T-R-A-I-N, T-R-A-I-N. Each child shouts one letter as you march."
      },
      mistakes: ["Writing 'ay' in middle position"],
      check: "Dictate: rain, mail, train, wait. 3 of 4 = pass."
    }
  },
  {
    week: 16,
    unit: "Vowel Teams",
    reading: {
      focus: "ay (day, play)",
      title: "AY — long A at the end",
      summary: "AY ends words. AI is for the middle.",
      words: ["day", "play", "say", "way", "may", "stay", "tray", "gray", "today", "pay"],
      sentence: "Today we may play all day.",
      activity: {
        kind: "Game",
        name: "Stay or Go?",
        body: "Show two cards: ai (middle) and ay (end). Say a word — child points to which spelling pattern fits where the long-A is. Builds positional awareness."
      },
      song: "Chant: 'AY at the end, AI in the middle — that's how we spell long A, no riddle!'",
      prereqs: ["ai mastery"],
      mistakes: ["Mixing up ai vs ay positionally"],
      check: "Read 6: day, play, say, way, stay, gray."
    },
    spelling: {
      focus: "ay + Dolch: there, them, then",
      pattern: "Long A at the end of a word → ay.",
      words: ["day", "play", "say", "way", "stay", "gray"],
      sightWords: ["there", "them", "then"],
      sentence: "Then there is a way to play.",
      activity: {
        kind: "Hands-on",
        name: "Position Sort",
        body: "Two columns — 'middle' and 'end'. Sort 16 long-A words into the right column."
      },
      mistakes: ["Putting ay in middle (plai for play)"],
      check: "Dictate: day, play, way, stay. 3 of 4 = pass."
    }
  },
  {
    week: 17,
    unit: "Vowel Teams",
    reading: {
      focus: "oa (boat, road)",
      title: "OA — long O team",
      summary: "OA makes long O. Usually in the middle.",
      words: ["boat", "road", "coat", "soap", "goat", "toast", "load", "soak", "float", "throat"],
      sentence: "The goat ate toast on the boat.",
      activity: {
        kind: "Game",
        name: "Row Your Boat",
        body: "Sit facing each other, hold hands, rock back and forth. Sing 'Row Row Row' but swap in oa words: 'Float, float, float your goat...'"
      },
      song: "Use 'Row Row Row Your Boat' as the OA anthem — every chorus, list 4 oa words.",
      prereqs: ["Long O via o_e"],
      mistakes: ["Confusing oa with ow"],
      check: "Read 6: boat, road, coat, goat, soap, float."
    },
    spelling: {
      focus: "oa + Dolch: out, big, find",
      pattern: "Long O in middle → oa.",
      words: ["boat", "road", "coat", "goat", "soap", "float"],
      sightWords: ["out", "big", "find"],
      sentence: "Find the big boat out there.",
      activity: {
        kind: "Movement",
        name: "Boat Rock",
        body: "Stand and sway side to side like a boat on water. Each sway = one letter of an oa word."
      },
      mistakes: ["Using o_e where oa is right (mid-word)"],
      check: "Dictate: boat, road, goat, soap. 3 of 4 = pass."
    }
  },
  {
    week: 18,
    unit: "Vowel Teams",
    reading: {
      focus: "ow (snow, low) — long O version",
      title: "OW — long O at the end",
      summary: "OW often makes long O at the end of a word. (It can also say /ow/ as in cow — that's next.)",
      words: ["snow", "low", "show", "blow", "slow", "grow", "yellow", "follow", "window", "below"],
      sentence: "The slow snow will grow below the window.",
      activity: {
        kind: "Game",
        name: "Snow Fall",
        body: "Drop a cotton ball from above your head. While it falls, say a long-O ow word. Slow falls = slow words like 'slooow', 'grooow'."
      },
      song: "To 'Twinkle': O and W at the end of a row / make the long O sound, you know / snow and blow and grow and low / O-W makes long O glow.",
      prereqs: ["oa mastery"],
      mistakes: ["Reading 'ow' as /ow/ in cow — context tells you which"],
      check: "Read 6: snow, low, show, slow, grow, yellow."
    },
    spelling: {
      focus: "ow + Dolch: down, will, jump",
      pattern: "Long O at end of word → often ow.",
      words: ["snow", "low", "show", "slow", "grow", "yellow"],
      sightWords: ["down", "will", "jump"],
      sentence: "I will jump down in the snow.",
      activity: {
        kind: "Hands-on",
        name: "OA / OW Sort",
        body: "Two piles — middle (oa) vs end (ow). Listen for where the long-O lives in the word."
      },
      mistakes: ["Using ow in middle (snwo)"],
      check: "Dictate: snow, slow, grow, show. 3 of 4 = pass."
    }
  },
  {
    week: 19,
    unit: "Vowel Teams",
    reading: {
      focus: "ou & ow (cloud, cow)",
      title: "Diphthong /ow/",
      summary: "Like the sound when you stub your toe — OW! Two spellings.",
      words: ["out", "loud", "cloud", "round", "found", "cow", "now", "how", "down", "town"],
      sentence: "How did the cow get out of town?",
      activity: {
        kind: "Game",
        name: "Ouch!",
        body: "Pretend to bump into furniture saying 'OW!' or 'OUCH!' Each ouch = one new ou/ow word. Big sound match."
      },
      song: "Chant: 'OU in the middle, OW at the end — when your toe gets hurt, that's the sound to send!'",
      prereqs: ["Long-O ow"],
      mistakes: ["Confusing with long-O ow — context matters"],
      check: "Read 6: out, cloud, found, cow, how, town."
    },
    spelling: {
      focus: "ou/ow diphthong + Dolch: about, our, house",
      pattern: "/ow/ in middle → ou. /ow/ at end → ow.",
      words: ["out", "loud", "found", "cow", "now", "down"],
      sightWords: ["about", "our", "house"],
      sentence: "Our house is about a town away.",
      activity: {
        kind: "Movement",
        name: "Toe Stub",
        body: "Tap toe on floor saying 'OW!' Then spell the word with three big arm sweeps. Body memory."
      },
      mistakes: ["Mixing positions"],
      check: "Dictate: out, loud, cow, down. 3 of 4 = pass."
    }
  },
  {
    week: 20,
    unit: "Vowel Teams",
    reading: {
      focus: "oo (long: moon, soon)",
      title: "OO — the long version",
      summary: "Two O's, like the sound of a ghost. Boooo!",
      words: ["moon", "soon", "food", "room", "zoo", "boot", "tooth", "school", "pool", "spoon"],
      sentence: "The moon is soon at the zoo.",
      activity: {
        kind: "Game",
        name: "Ghost Sounds",
        body: "Hold a sheet over head. 'Boooo!' Each ghostly hoot = an oo word said. Spooky vocab fun."
      },
      song: "To 'You Are My Sunshine': O-O makes a long oo sound / like a ghost flying around / moon and soon and food and zoo / boot and tooth and pool and you.",
      prereqs: ["All vowel teams so far"],
      mistakes: ["Confusing with short oo (book, look)"],
      check: "Read 6: moon, soon, food, zoo, school, spoon."
    },
    spelling: {
      focus: "long oo + Dolch: too, into, who",
      pattern: "Long oo sound → oo.",
      words: ["moon", "soon", "food", "zoo", "school", "spoon"],
      sightWords: ["too", "into", "who"],
      sentence: "Who is going into school too?",
      activity: {
        kind: "Hands-on",
        name: "Ghost Letters",
        body: "Use a white crayon on white paper to write oo words — invisible! Paint over with watercolor to reveal. Magical reveal."
      },
      mistakes: ["Single o"],
      check: "Dictate: moon, food, zoo, spoon. 3 of 4 = pass."
    }
  },
  {
    week: 21,
    unit: "Vowel Teams",
    reading: {
      focus: "oo (short: book, look)",
      title: "OO — the short version",
      summary: "Same letters, shorter sound. Like 'oof' when you sit down.",
      words: ["book", "look", "took", "good", "wood", "foot", "cook", "stood", "shook", "hook"],
      sentence: "I took a good book and stood by the wood.",
      activity: {
        kind: "Game",
        name: "Oof! Sit Down",
        body: "Stand-Sit-Stand-Sit. Each sit = 'oof!' and a short-oo word. Each stand = 'ooo!' and a long-oo word. Sort by feel."
      },
      song: "Chant: 'Long oo says ooo like a moon / Short oo says oof like a book / Same letters, different tune — give them both a look!'",
      prereqs: ["Long oo"],
      mistakes: ["Mixing the two oo sounds — usually figured out by what makes sense in the sentence"],
      check: "Read 6: book, look, took, good, foot, cook."
    },
    spelling: {
      focus: "short oo + Dolch: could, would, should",
      pattern: "Short oo → still oo. Context decides which sound.",
      words: ["book", "look", "took", "good", "foot", "cook"],
      sightWords: ["could", "would", "should"],
      sentence: "I could cook a good meal.",
      activity: {
        kind: "Movement",
        name: "Long vs Short March",
        body: "Big steps for long oo, baby steps for short oo. Call words and child marches accordingly."
      },
      mistakes: ["Trying to use a different spelling for short oo"],
      check: "Dictate: book, look, good, foot. 3 of 4 = pass."
    }
  },
  {
    week: 22,
    unit: "Vowel Teams",
    reading: {
      focus: "oi & oy (coin, boy)",
      title: "OI / OY",
      summary: "The 'boy oh boy' sound. OI in middle, OY at end.",
      words: ["coin", "join", "boil", "soil", "point", "boy", "toy", "joy", "enjoy", "royal"],
      sentence: "The boy will enjoy his new toy.",
      activity: {
        kind: "Game",
        name: "Boy Oh Boy",
        body: "Slap forehead 'oh boy!' style. Each slap = one oi/oy word. Dramatic + memorable."
      },
      song: "To 'Old MacDonald': And on this farm we had a BOY / e-i-e-i-OY! With an enjoy here, a toy there, here a joy, there a coin...",
      prereqs: ["ou/ow diphthong"],
      mistakes: ["Position confusion (oy in middle)"],
      check: "Read 6: coin, join, boy, toy, joy, enjoy."
    },
    spelling: {
      focus: "oi/oy + Dolch: where, why, when",
      pattern: "/oy/ in middle → oi. /oy/ at end → oy.",
      words: ["coin", "join", "boil", "boy", "toy", "joy"],
      sightWords: ["where", "why", "when"],
      sentence: "Where is the toy and why is it here?",
      activity: {
        kind: "Hands-on",
        name: "Coin Toss",
        body: "Toss a real coin. Heads = write an oi word. Tails = write an oy word. Two minutes, see how many."
      },
      mistakes: ["Using oy in middle"],
      check: "Dictate: coin, boil, boy, joy. 3 of 4 = pass."
    }
  },

  // ─────────── UNIT 5 — R-Controlled Vowels ───────────
  {
    week: 23,
    unit: "R-Controlled (Bossy R)",
    reading: {
      focus: "ar (car, star)",
      title: "Bossy R — AR",
      summary: "R bosses the vowel — A doesn't say its name OR its short sound. AR = 'arrr' like a pirate.",
      words: ["car", "star", "park", "card", "farm", "art", "hard", "bark", "yard", "shark"],
      sentence: "The shark in the park has a hard bark.",
      activity: {
        kind: "Game",
        name: "Pirate Talk",
        body: "Talk like a pirate the entire lesson. 'Arrr matey, where be the carrr?' Every AR word gets a pirate growl. Children love this."
      },
      song: "Chant in pirate voice: 'Arrr says R when it follows an A / Car and star and park all day!'",
      prereqs: ["All vowel teams"],
      mistakes: ["Reading short or long A separately from R"],
      check: "Read 6: car, star, park, farm, hard, shark."
    },
    spelling: {
      focus: "ar + Dolch: their, that, who",
      pattern: "/ar/ sound → ar.",
      words: ["car", "star", "park", "farm", "hard", "shark"],
      sightWords: ["their", "that", "who"],
      sentence: "That is their car at the park.",
      activity: {
        kind: "Movement",
        name: "Pirate Stomp",
        body: "Stomp like a pirate with peg leg. Each stomp = one letter of an ar word."
      },
      mistakes: ["Using just 'r' or just 'a'"],
      check: "Dictate: car, star, farm, park. 3 of 4 = pass."
    }
  },
  {
    week: 24,
    unit: "R-Controlled (Bossy R)",
    reading: {
      focus: "or (corn, fork)",
      title: "Bossy R — OR",
      summary: "OR — the doctor sound. Like saying 'oar' or what a horse says: 'horn'.",
      words: ["for", "corn", "fork", "horn", "born", "sort", "short", "sport", "torch", "porch"],
      sentence: "The short horse has a horn made of corn.",
      activity: {
        kind: "Game",
        name: "Horn Honk",
        body: "Honk an imaginary horn (HONK HONK!) for each OR word. Drive a pretend car around the room reading or words off cards."
      },
      song: "To 'Old MacDonald': And on this farm we had a HORN / e-i-e-i-OR! With a corn-corn here, a fork-fork there...",
      prereqs: ["ar"],
      mistakes: ["Reading OR as long O"],
      check: "Read 6: for, corn, fork, horn, short, sport."
    },
    spelling: {
      focus: "or + Dolch: your, more, before",
      pattern: "/or/ sound → or.",
      words: ["for", "corn", "fork", "horn", "short", "sport"],
      sightWords: ["your", "more", "before"],
      sentence: "Get more corn for your horn before lunch.",
      activity: {
        kind: "Hands-on",
        name: "Bossy R Sort",
        body: "Three columns: ar / or / ___. Sort cards into groups. Add new R-controlled patterns as you learn them."
      },
      mistakes: ["Using oar instead of or"],
      check: "Dictate: for, corn, fork, short. 3 of 4 = pass."
    }
  },
  {
    week: 25,
    unit: "R-Controlled (Bossy R)",
    reading: {
      focus: "er, ir, ur (her, bird, turn)",
      title: "Bossy R — three ways to /er/",
      summary: "ER, IR, and UR all say the same /er/ sound. Common cause of spelling mix-ups.",
      words: ["her", "fern", "verb", "bird", "girl", "first", "turn", "burn", "hurt", "curl"],
      sentence: "The girl has a bird that can turn and curl.",
      activity: {
        kind: "Game",
        name: "Three-Way Guess",
        body: "Hear an /er/ word. Guess which spelling: er, ir, or ur. Track points over a week — the spelling pattern often has to be memorized per word."
      },
      song: "Chant: 'ER and IR and UR all say errr / like a growl from a small fluffy purr!'",
      prereqs: ["ar, or"],
      mistakes: ["Picking wrong spelling — all three sound the same. This must be memorized."],
      check: "Read 6: her, bird, turn, girl, hurt, first."
    },
    spelling: {
      focus: "er/ir/ur + Dolch: were, after, every",
      pattern: "/er/ has 3 spellings. Often: ER is most common, then IR, then UR. Some need memorization.",
      words: ["her", "bird", "turn", "girl", "hurt", "first"],
      sightWords: ["were", "after", "every"],
      sentence: "Every girl turned after her first race.",
      activity: {
        kind: "Hands-on",
        name: "Spelling Detectives",
        body: "Find 3 er, 3 ir, 3 ur words in a book this week. Add to a chart. Patterns emerge with time."
      },
      mistakes: ["Defaulting always to one spelling"],
      check: "Dictate: her, bird, turn, hurt. 3 of 4 = pass."
    }
  },

  // ─────────── UNIT 6 — Advanced Patterns ───────────
  {
    week: 26,
    unit: "Soft & Hard Sounds",
    reading: {
      focus: "Soft c (city, face) and soft g (gem, page)",
      title: "Soft C and Soft G",
      summary: "When C is followed by E, I, or Y → it sounds like /s/. Same rule with G → /j/.",
      words: ["city", "face", "race", "ice", "rice", "gem", "page", "cage", "huge", "stage"],
      sentence: "I see a huge gem on the stage.",
      activity: {
        kind: "Game",
        name: "C and G Detective",
        body: "Read words and decide: hard or soft? Look at the next letter. Build a 'rule chart' as you find examples in books."
      },
      song: "Chant: 'C and G are soft like silk / when E or I or Y comes next / face and ice and gem and page / soft sounds save the day!'",
      prereqs: ["All previous units"],
      mistakes: ["Using hard C/G in front of E, I, Y"],
      check: "Read 6: city, face, ice, gem, page, huge."
    },
    spelling: {
      focus: "soft c/g + Dolch: been, again, please",
      pattern: "/s/ sound → c if followed by e/i/y. /j/ sound → g if followed by e/i/y.",
      words: ["city", "face", "ice", "gem", "page", "huge"],
      sightWords: ["been", "again", "please"],
      sentence: "Please read this page again.",
      activity: {
        kind: "Hands-on",
        name: "Rule Cards",
        body: "Make two cards: 'C + e/i/y = /s/' and 'G + e/i/y = /j/'. Reference them all week."
      },
      mistakes: ["Using k or s instead of soft c"],
      check: "Dictate: face, ice, gem, page. 3 of 4 = pass."
    }
  },
  {
    week: 27,
    unit: "Advanced Patterns",
    reading: {
      focus: "-tch (catch, watch) and -dge (bridge, edge)",
      title: "Three-letter endings",
      summary: "After a short vowel, /ch/ at end is often -tch and /j/ at end is often -dge.",
      words: ["catch", "watch", "match", "patch", "fetch", "edge", "bridge", "judge", "fudge", "badge"],
      sentence: "I will catch the fudge on the edge of the bridge.",
      activity: {
        kind: "Game",
        name: "Catch & Spell",
        body: "Toss a soft ball. Each catch = say a tch or dge word. Drop = lose a turn."
      },
      song: "Chant: 'Short vowel needs a friend at the end — t-c-h or d-g-e to defend!'",
      prereqs: ["ch, ck, soft g"],
      mistakes: ["Just writing -ch or -ge after short vowel"],
      check: "Read 6: catch, watch, match, edge, bridge, judge."
    },
    spelling: {
      focus: "-tch / -dge + Dolch: think, know, well",
      pattern: "Short vowel + /ch/ at end → -tch. Short vowel + /j/ at end → -dge.",
      words: ["catch", "watch", "match", "edge", "bridge", "judge"],
      sightWords: ["think", "know", "well"],
      sentence: "I know the judge will think well.",
      activity: {
        kind: "Movement",
        name: "Three-Letter Hop",
        body: "Hop three times for the three-letter ending: T (hop) C (hop) H (hop). Big body memory for spelling."
      },
      mistakes: ["Forgetting the silent letter"],
      check: "Dictate: catch, match, edge, bridge. 3 of 4 = pass."
    }
  },
  {
    week: 28,
    unit: "Advanced Patterns",
    reading: {
      focus: "igh (light, night)",
      title: "Three-letter long I",
      summary: "I-G-H all together makes long I. The G and H are silent.",
      words: ["light", "night", "right", "might", "sight", "bright", "fight", "tight", "high", "sigh"],
      sentence: "I might see a bright light at night.",
      activity: {
        kind: "Game",
        name: "Flashlight Tag",
        body: "Turn off lights. Shine flashlight on igh word cards taped to walls. Read each one out loud as it's lit."
      },
      song: "To 'Star Light Star Bright': IGH IGH says long I / silent G and silent H stand by / Light and night and high and sight / IGH IGH IGH in the dark of night.",
      prereqs: ["i_e mastery"],
      mistakes: ["Trying to sound out the g and h"],
      check: "Read 6: light, night, right, sight, bright, high."
    },
    spelling: {
      focus: "igh + Dolch: any, just, came",
      pattern: "Long I in middle/end → sometimes igh.",
      words: ["light", "night", "right", "high", "sight", "bright"],
      sightWords: ["any", "just", "came"],
      sentence: "Just came back at night.",
      activity: {
        kind: "Hands-on",
        name: "Silent Letters Tap",
        body: "Tap loudly for sounded letters, tap silently (just touch) for silent letters. L (loud) - I (loud) - G (silent) - H (silent) - T (loud) = light."
      },
      mistakes: ["Writing 'ite' instead of 'ight'"],
      check: "Dictate: light, night, high, right. 3 of 4 = pass."
    }
  },
  {
    week: 29,
    unit: "Advanced Patterns",
    reading: {
      focus: "y as long E (happy, baby) and y as long I (cry, sky)",
      title: "Y the chameleon",
      summary: "At the end of a one-syllable word, Y = long I. At end of multi-syllable, Y = long E.",
      words: ["cry", "sky", "fly", "try", "why", "happy", "baby", "puppy", "funny", "sunny"],
      sentence: "The happy baby will try to fly in the sunny sky.",
      activity: {
        kind: "Game",
        name: "Clap the Syllables",
        body: "Clap a word's syllables. One clap → Y is long I. Two+ claps → Y is long E. happy = clap clap → long E. cry = clap → long I."
      },
      song: "Chant: 'One-clap word, Y says I — cry, fly, sky reach high! / More-clap word, Y says E — happy, puppy, you and me!'",
      prereqs: ["Long I, Long E"],
      mistakes: ["Reading y as /y/ at the end"],
      check: "Read 6: cry, sky, fly, happy, baby, sunny."
    },
    spelling: {
      focus: "y endings + Dolch: many, very, also",
      pattern: "End-Y on short word = long I. End-Y on longer word = long E.",
      words: ["cry", "sky", "fly", "happy", "baby", "puppy"],
      sightWords: ["many", "very", "also"],
      sentence: "Many puppies are very happy.",
      activity: {
        kind: "Hands-on",
        name: "Syllable Sort",
        body: "Sort words into 1-clap and 2+-clap piles. Notice the Y sound difference."
      },
      mistakes: ["Using ie or ee instead of y"],
      check: "Dictate: cry, sky, happy, baby. 3 of 4 = pass."
    }
  },
  {
    week: 30,
    unit: "Advanced Patterns",
    reading: {
      focus: "Plural -s and -es",
      title: "Making more than one",
      summary: "Add -s to most words. Add -es after s, x, ch, sh, z (so we can hear it).",
      words: ["cats", "dogs", "books", "hats", "boxes", "wishes", "buses", "foxes", "dishes", "kisses"],
      sentence: "The boxes have books and dishes inside.",
      activity: {
        kind: "Game",
        name: "One or Many",
        body: "Show object cards (one cat, three cats). Child says singular or plural and writes it. Tactile + grammar combo."
      },
      song: "Chant: 'S-X-CH-SH-Z, give me ES — so I can say each one with ease!'",
      prereqs: ["All single-word patterns"],
      mistakes: ["Just adding s where es is needed (boxs)"],
      check: "Read 6: cats, books, boxes, wishes, foxes, dishes."
    },
    spelling: {
      focus: "-s/-es + Dolch: another, write, brother",
      pattern: "Add -es when word ends in s, x, ch, sh, z.",
      words: ["cats", "books", "boxes", "wishes", "foxes", "dishes"],
      sightWords: ["another", "write", "brother"],
      sentence: "Write another wish for my brother.",
      activity: {
        kind: "Movement",
        name: "Plural Stretch",
        body: "Stretch arms wide for -es words ('eeesss!'), one finger up for -s words. Feels the extra syllable."
      },
      mistakes: ["Forgetting the extra e"],
      check: "Dictate: cats, boxes, wishes, dishes. 3 of 4 = pass."
    }
  },
  {
    week: 31,
    unit: "Review & Fluency",
    reading: {
      focus: "Compound words & contractions",
      title: "Putting words together, taking parts away",
      summary: "Compound = two words joined (sunshine). Contraction = letters squeezed out with apostrophe (don't = do not).",
      words: ["sunshine", "playground", "bedroom", "rainbow", "cannot", "don't", "I'm", "it's", "can't", "we'll"],
      sentence: "I'm playing on the playground in the sunshine.",
      activity: {
        kind: "Game",
        name: "Squish & Squeeze",
        body: "Two cards say 'do' and 'not'. Push them together. Pop! An apostrophe replaces the 'o' — now it's 'don't'. Physical metaphor for contraction."
      },
      song: "Chant: 'When two words squish into one, an apostrophe takes the missing letter's spot!'",
      prereqs: ["Lots of solid reading"],
      mistakes: ["Reading don't as 'dont' (no contraction sound)"],
      check: "Read 6: sunshine, bedroom, don't, I'm, can't, it's."
    },
    spelling: {
      focus: "compounds + contractions + Dolch: little, give, fast",
      pattern: "Compound: just join. Contraction: apostrophe replaces missing letters.",
      words: ["sunshine", "bedroom", "don't", "I'm", "can't", "it's"],
      sightWords: ["little", "give", "fast"],
      sentence: "Give me a little bit of sunshine fast.",
      activity: {
        kind: "Hands-on",
        name: "Apostrophe Sticky",
        body: "Use a small sticker as the apostrophe. Place it where the missing letters were. Move it around. Visual + tactile."
      },
      mistakes: ["Apostrophe in wrong spot"],
      check: "Dictate: bedroom, don't, can't, sunshine. 3 of 4 = pass."
    }
  },
  {
    week: 32,
    unit: "Review & Fluency",
    reading: {
      focus: "Mixed review + reading a decodable",
      title: "Putting it all together",
      summary: "Read a full short decodable story using all patterns learned this year.",
      words: ["Read short stories that mix all patterns: digraphs, blends, silent E, vowel teams, R-controlled, soft c/g, plurals."],
      sentence: "The little fox in the green tree saw a bright light at night and made a wish.",
      activity: {
        kind: "Celebration",
        name: "Reading Picnic",
        body: "Pack a snack, sit outside, read a decodable book together. Take turns by sentence. End with cheering for the year of progress."
      },
      song: "Sing favorite phonics songs from the year as a medley.",
      prereqs: ["All units"],
      mistakes: ["Speed over accuracy — slow down at unfamiliar patterns"],
      check: "Child reads a 1-page decodable with 90%+ accuracy."
    },
    spelling: {
      focus: "Mixed review dictation + final Dolch words: live, thank, walk",
      pattern: "Apply all spelling rules from the year.",
      words: ["beach", "snake", "bird", "happy", "boxes", "don't"],
      sightWords: ["live", "thank", "walk"],
      sentence: "Thank you — I live and walk by the beach.",
      activity: {
        kind: "Celebration",
        name: "Word of the Year",
        body: "Each child picks their favorite word from the year. Write it big, decorate it, hang it up. Reflect on growth."
      },
      mistakes: ["Rushing through review — encourage careful work"],
      check: "Dictate 6 mixed words. 5 of 6 = year complete."
    }
  }
];
