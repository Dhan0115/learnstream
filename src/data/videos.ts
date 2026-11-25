// Seeded lessons (design_spec.md §8.9). Used by prisma/seed.ts.
import type { Video } from '../types'

export const seedVideos: Video[] = [
  {
    "id": "vid-spanish",
    "title": "Spanish Conversation Basics — Greetings",
    "description": "Say hello and introduce yourself in Spanish. Practise greetings, names, where you are from, and polite goodbyes through slow, repeatable dialogues you can shadow out loud.",
    "subjectSlug": "languages",
    "tags": [
      "beginner",
      "spanish",
      "speaking"
    ],
    "uploaderId": "u-priya",
    "uploaderName": "Priya Raghavan",
    "src": "",
    "thumbnail": "https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=photorealistic%20still%20of%20an%20open%20language%20textbook%20with%20handwritten%20flashcards%20and%20a%20cup%20of%20coffee%20on%20a%20bright%20table%2C%20no%20readable%20text&image_size=landscape_16_9",
    "durationSec": 703,
    "views": 28900,
    "likes": 2340,
    "dislikes": 31,
    "createdAt": "2026-10-31T07:30:00.000Z",
    "status": "published",
    "captions": [
      {
        "start": 0,
        "end": 18,
        "text": "¡Hola! In this lesson you will greet someone, give your name and say where you are from — in Spanish."
      },
      {
        "start": 18,
        "end": 45,
        "text": "Start with the most useful word you own: hola. It works morning, noon and night."
      },
      {
        "start": 45,
        "end": 80,
        "text": "Add a time of day. Buenos días in the morning, buenas tardes after lunch, buenas noches at night."
      },
      {
        "start": 80,
        "end": 120,
        "text": "Now introduce yourself: me llamo Ana. Literally, I call myself Ana."
      },
      {
        "start": 120,
        "end": 165,
        "text": "Ask the other person: ¿Cómo te llamas? Repeat it slowly — ¿cómo te llamas?"
      },
      {
        "start": 165,
        "end": 215,
        "text": "To ask where someone is from: ¿De dónde eres? Answer with soy de, then your city."
      },
      {
        "start": 215,
        "end": 265,
        "text": "Soy de México. Soy de Japón. Soy de España. Notice the pattern never changes."
      },
      {
        "start": 265,
        "end": 320,
        "text": "One polite check: ¿Cómo estás? — how are you? Reply estoy bien, gracias."
      },
      {
        "start": 320,
        "end": 380,
        "text": "If you did not catch it, say ¿Cómo? or más despacio, por favor."
      },
      {
        "start": 380,
        "end": 440,
        "text": "Let us shadow the whole dialogue. Say each line straight after me, out loud."
      },
      {
        "start": 440,
        "end": 520,
        "text": "Hola, buenas tardes. Me llamo Ana. ¿Cómo te llamas? — Soy Kenji. ¿De dónde eres? — Soy de Japón."
      },
      {
        "start": 520,
        "end": 580,
        "text": "Run that dialogue twice more. Speaking aloud is what moves a phrase into memory."
      },
      {
        "start": 580,
        "end": 640,
        "text": "Saying goodbye: adiós, hasta luego, and the friendly nos vemos."
      },
      {
        "start": 640,
        "end": 703,
        "text": "That is your first conversation. Practise it once more before the next lesson."
      }
    ]
  },
  {
    "id": "vid-photosynthesis",
    "title": "Photosynthesis: How Plants Make Food",
    "description": "Follow light energy from a leaf surface to a sugar molecule. Covers chlorophyll, the light-dependent reactions, the Calvin cycle and the factors that limit the rate of photosynthesis.",
    "subjectSlug": "science",
    "tags": [
      "biology",
      "plants",
      "energy"
    ],
    "uploaderId": "u-priya",
    "uploaderName": "Priya Raghavan",
    "src": "/media/videos/photosynthesis-how-plants-make-food.mp4",
    "thumbnail": "/media/thumbnails/photosynthesis-how-plants-make-food-thumbnail.png",
    "durationSec": 360,
    "views": 19401,
    "likes": 1520,
    "dislikes": 24,
    "createdAt": "2026-10-27T16:10:00.000Z",
    "status": "published",
    "captions": [
      {
        "start": 0,
        "end": 14,
        "text": "Every leaf is a small factory. Today we follow one beam of sunlight all the way to a sugar molecule."
      },
      {
        "start": 14,
        "end": 34,
        "text": "Inside the chloroplast, chlorophyll absorbs mostly red and blue light and reflects green — which is why leaves look green."
      },
      {
        "start": 34,
        "end": 62,
        "text": "The light-dependent reactions split water, release oxygen, and store energy in ATP and NADPH."
      },
      {
        "start": 62,
        "end": 95,
        "text": "Those two molecules travel into the stroma, where the Calvin cycle will use them."
      },
      {
        "start": 95,
        "end": 140,
        "text": "In the Calvin cycle, carbon dioxide is fixed onto a five-carbon sugar. This step does not need light directly."
      },
      {
        "start": 140,
        "end": 185,
        "text": "Using ATP and NADPH, the cycle reduces that carbon into G3P — the raw material for glucose."
      },
      {
        "start": 185,
        "end": 230,
        "text": "Count the atoms: six carbon dioxide molecules in, one glucose out. So the cycle has to turn six times."
      },
      {
        "start": 230,
        "end": 290,
        "text": "Now the limiting factors. Light intensity, carbon dioxide concentration and temperature each set a ceiling."
      },
      {
        "start": 290,
        "end": 340,
        "text": "Raise the light and the rate climbs — until something else becomes the bottleneck."
      },
      {
        "start": 340,
        "end": 400,
        "text": "That idea of the bottleneck is the single most examined idea on this topic."
      },
      {
        "start": 400,
        "end": 470,
        "text": "Let us read a rate graph together. Watch where the line flattens; that is the limiting factor at work."
      },
      {
        "start": 470,
        "end": 540,
        "text": "Here is the same graph at a higher temperature. Notice the plateau moves — until the enzymes denature."
      },
      {
        "start": 540,
        "end": 620,
        "text": "Try this one: a plant in a sealed box with plenty of light. What limits it now, and why?"
      },
      {
        "start": 620,
        "end": 700,
        "text": "Answer: carbon dioxide. The light reactions can only run as fast as the Calvin cycle consumes their output."
      },
      {
        "start": 700,
        "end": 812,
        "text": "Recap: light reactions make ATP and NADPH, the Calvin cycle spends them, and the slowest step sets the pace."
      }
    ]
  },
  {
    "id": "vid-git",
    "title": "Git & GitHub Crash Course",
    "description": "Version control without the fear. Commit, branch, merge and resolve your first conflict, then push to a remote repository and open a pull request using a clean, repeatable workflow.",
    "subjectSlug": "programming",
    "tags": [
      "git",
      "github",
      "version control"
    ],
    "uploaderId": "u-priya",
    "uploaderName": "Priya Raghavan",
    "src": "/media/videos/git-and-github-crash-course.mp4",
    "thumbnail": "/media/thumbnails/git-and-github-crash-course-thumbnail.png",
    "durationSec": 600,
    "views": 54100,
    "likes": 3620,
    "dislikes": 47,
    "createdAt": "2026-10-14T15:45:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-color-theory",
    "title": "Color Theory for Digital Artists",
    "description": "Choose colour on purpose. Learn hue, saturation and value, build complementary and analogous palettes, and fix muddy artwork using value studies before you ever touch colour.",
    "subjectSlug": "art",
    "tags": [
      "design",
      "color",
      "illustration"
    ],
    "uploaderId": "u-amara",
    "uploaderName": "Dr. Amara Okafor",
    "src": "",
    "thumbnail": "https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=photorealistic%20still%20of%20a%20digital%20tablet%20and%20stylus%20beside%20a%20colour%20wheel%20print%20and%20paint%20swatches%2C%20soft%20studio%20light%2C%20creative%20desk%2C%20no%20readable%20text&image_size=landscape_16_9",
    "durationSec": 1145,
    "views": 35800,
    "likes": 3090,
    "dislikes": 39,
    "createdAt": "2026-10-09T17:35:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-cell",
    "title": "The Cell: Structure and Function",
    "description": "Tour the building block of life. You will identify the nucleus, mitochondria, ribosomes and membrane, then connect each organelle to the job it performs. Includes a comparison of plant and animal cells.",
    "subjectSlug": "science",
    "tags": [
      "biology",
      "cells",
      "organelles"
    ],
    "uploaderId": "u-priya",
    "uploaderName": "Priya Raghavan",
    "src": "/media/videos/the-cell-structure-and-function.mp4",
    "thumbnail": "/media/thumbnails/the-cell-structure-and-function-thumbnail.png",
    "durationSec": 360,
    "views": 52800,
    "likes": 4010,
    "dislikes": 71,
    "createdAt": "2026-10-02T11:05:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-bigo",
    "title": "Big-O Notation in 10 Minutes",
    "description": "Stop guessing whether your code scales. Learn to read and write Big-O, compare common growth rates, and analyse loops and recursion with confidence. Ends with a short practice set.",
    "subjectSlug": "programming",
    "tags": [
      "algorithms",
      "complexity",
      "interviews"
    ],
    "uploaderId": "u-amara",
    "uploaderName": "Dr. Amara Okafor",
    "src": "/media/videos/big-o-notation-in-10-minutes.mp4",
    "thumbnail": "/media/thumbnails/big-o-notation-thumbnail.png",
    "durationSec": 600,
    "views": 76300,
    "likes": 5890,
    "dislikes": 83,
    "createdAt": "2026-09-29T13:20:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-newton",
    "title": "Newton's Laws of Motion Explained",
    "description": "Three laws, countless applications. Learn inertia, F = ma and action–reaction through everyday demonstrations, then apply them to free-body diagrams and simple elevator and pulley problems.",
    "subjectSlug": "science",
    "tags": [
      "physics",
      "mechanics",
      "forces"
    ],
    "uploaderId": "u-kai",
    "uploaderName": "Kai Nakamura",
    "src": "",
    "thumbnail": "https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=photorealistic%20still%20of%20a%20physics%20classroom%20demonstration%20with%20a%20pendulum%20and%20stacked%20wooden%20blocks%20on%20a%20bench%2C%20warm%20afternoon%20light%2C%20no%20readable%20text&image_size=landscape_16_9",
    "durationSec": 1461,
    "views": 39700,
    "likes": 2860,
    "dislikes": 55,
    "createdAt": "2026-09-18T08:25:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-balance-sheet",
    "title": "Reading a Balance Sheet in 15 Minutes",
    "description": "Understand what a balance sheet claims about a business. Learn assets, liabilities and equity, how the three connect, and how to spot warning signs such as shrinking working capital.",
    "subjectSlug": "business",
    "tags": [
      "finance",
      "accounting",
      "investing"
    ],
    "uploaderId": "u-kai",
    "uploaderName": "Kai Nakamura",
    "src": "/media/videos/reading-a-balance-sheet-in-15-minutes.mp4",
    "thumbnail": "/media/thumbnails/reading-a-balance-sheet-thumbnail.png",
    "durationSec": 900,
    "views": 61200,
    "likes": 4470,
    "dislikes": 68,
    "createdAt": "2026-09-11T12:15:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-limits",
    "title": "Calculus I — Limits and Continuity",
    "description": "Build an intuition for limits before you meet a single derivative. You will learn how to read limit notation, evaluate limits algebraically and graphically, and decide whether a function is continuous at a point. Worked examples include one-sided limits and removable discontinuities.",
    "subjectSlug": "mathematics",
    "tags": [
      "calculus",
      "limits",
      "continuity"
    ],
    "uploaderId": "u-amara",
    "uploaderName": "Dr. Amara Okafor",
    "src": "/media/videos/calculus-i-limits-and-continuity.mp4",
    "thumbnail": "/media/thumbnails/calculus-i-limits-and-continuity-thumbnail.png",
    "durationSec": 360,
    "views": 48200,
    "likes": 3120,
    "dislikes": 62,
    "createdAt": "2026-09-04T09:15:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-vectors",
    "title": "Linear Algebra Essentials: Vectors & Matrices",
    "description": "A grounding in the objects that power graphics, machine learning and data science. Covers vector addition and scaling, the dot product, matrix multiplication, and what the determinant actually tells you, with geometric explanations throughout.",
    "subjectSlug": "mathematics",
    "tags": [
      "linear algebra",
      "vectors",
      "matrices"
    ],
    "uploaderId": "u-kai",
    "uploaderName": "Kai Nakamura",
    "src": "",
    "thumbnail": "https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=photorealistic%20still%20of%20a%20grid%20of%20plotted%20vectors%20and%20coordinate%20axes%20on%20graph%20paper%20beside%20a%20laptop%2C%20cool%20blue%20light%2C%20minimal%20study%20desk%2C%20no%20readable%20text&image_size=landscape_16_9",
    "durationSec": 1742,
    "views": 31500,
    "likes": 2210,
    "dislikes": 40,
    "createdAt": "2026-08-21T14:40:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-silk-road",
    "title": "The Silk Road: Trade That Shaped the World",
    "description": "More than a route for silk. Explore how caravans moved goods, ideas, religions and diseases between China, Persia and Rome, and why the network reshaped the medieval world.",
    "subjectSlug": "history",
    "tags": [
      "ancient",
      "trade",
      "world history"
    ],
    "uploaderId": "u-amara",
    "uploaderName": "Dr. Amara Okafor",
    "src": "/media/videos/the-silk-road-trade-that-shaped-the-world.mp4",
    "thumbnail": "/media/thumbnails/the-silk-road-trade-that-shaped-the-world-thumbnail.png",
    "durationSec": 900,
    "views": 42700,
    "likes": 3480,
    "dislikes": 96,
    "createdAt": "2026-08-08T09:50:00.000Z",
    "status": "published"
  },
  {
    "id": "vid-python",
    "title": "Python for Beginners: Your First Program",
    "description": "Write and run your first lines of Python today. You will install an editor, print output, store values in variables, take input from the user, and branch with if/else — no prior experience assumed.",
    "subjectSlug": "programming",
    "tags": [
      "python",
      "beginner",
      "fundamentals"
    ],
    "uploaderId": "u-kai",
    "uploaderName": "Kai Nakamura",
    "src": "/media/videos/python-for-beginners-your-first-program.mp4",
    "thumbnail": "/media/thumbnails/python-your-first-program.png",
    "durationSec": 153,
    "views": 128400,
    "likes": 9430,
    "dislikes": 118,
    "createdAt": "2026-07-30T10:00:00.000Z",
    "status": "published"
  }
]
