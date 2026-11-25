// Seeded questions (design_spec.md §8.9). Used by prisma/seed.ts.
import type { Comment } from '../types'

export const seedComments: Comment[] = [
  {
    "id": "cmt-3",
    "videoId": "vid-python",
    "authorName": "Dr. Amara Okafor",
    "body": "I used this as the first lesson for my adult beginners class and every single person ran their own program before the end.",
    "createdAt": "2026-10-15T08:40:00.000Z"
  },
  {
    "id": "cmt-1",
    "videoId": "vid-limits",
    "authorName": "Priya Raghavan",
    "body": "The graph-first explanation finally made one-sided limits click for me. Could you do a follow-up on limits at infinity?",
    "createdAt": "2026-10-21T10:12:00.000Z"
  },
  {
    "id": "cmt-5",
    "videoId": "vid-silk-road",
    "authorName": "Priya Raghavan",
    "body": "The point about ideas travelling along with goods changed how I think about the period. Thank you.",
    "createdAt": "2026-10-25T15:55:00.000Z"
  },
  {
    "id": "cmt-2",
    "videoId": "vid-limits",
    "authorName": "Kai Nakamura",
    "body": "The worked example at 14:20 is worth rewatching — that is exactly the pattern that appears in the exam.",
    "createdAt": "2026-11-02T19:05:00.000Z"
  },
  {
    "id": "cmt-6",
    "videoId": "vid-color-theory",
    "authorName": "Kai Nakamura",
    "body": "Doing the value study before blocking in colour fixed my muddy paintings immediately.",
    "createdAt": "2026-11-05T09:18:00.000Z"
  },
  {
    "id": "cmt-4",
    "videoId": "vid-python",
    "authorName": "Alex Rivera",
    "body": "Does the editor matter, or can I follow along in any IDE?",
    "createdAt": "2026-11-08T12:30:00.000Z"
  }
]
