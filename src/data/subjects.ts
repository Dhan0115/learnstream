// Seeded subjects (design_spec.md §8.9). Used by prisma/seed.ts.
import type { Subject } from '../types'

export const subjects: Subject[] = [
  {
    "id": "sub-art",
    "slug": "art",
    "name": "Art",
    "icon": "A",
    "tagline": "Drawing, design, colour and creative practice."
  },
  {
    "id": "sub-business",
    "slug": "business",
    "name": "Business",
    "icon": "B",
    "tagline": "Finance, marketing, management and entrepreneurship."
  },
  {
    "id": "sub-history",
    "slug": "history",
    "name": "History",
    "icon": "H",
    "tagline": "People, civilisations and the events that shaped us."
  },
  {
    "id": "sub-languages",
    "slug": "languages",
    "name": "Languages",
    "icon": "L",
    "tagline": "Speak, read and write with confidence."
  },
  {
    "id": "sub-math",
    "slug": "mathematics",
    "name": "Mathematics",
    "icon": "M",
    "tagline": "Algebra, calculus, geometry and statistics."
  },
  {
    "id": "sub-programming",
    "slug": "programming",
    "name": "Programming",
    "icon": "P",
    "tagline": "Write real code, from first steps to algorithms."
  },
  {
    "id": "sub-science",
    "slug": "science",
    "name": "Science",
    "icon": "S",
    "tagline": "Physics, chemistry and biology fundamentals."
  },
  {
    "id": "sub-test-prep",
    "slug": "test-preparation",
    "name": "Test Preparation",
    "icon": "T",
    "tagline": "Strategy and practice for SAT, ACT and IELTS."
  }
]
