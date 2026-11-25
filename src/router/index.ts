import { createRouter, createWebHistory } from 'vue-router'
import { applyRouteMeta } from '@/composables/usePageMeta'
import { useSession } from '@/composables/useSession'

const { user, canUpload, isStaff } = useSession()

// Route table mirrors design_spec.md §2. Pages are lazy so each slice ships
// only the code its screens need. Each route carries the title and description
// a search engine should index for it (design_spec.md §4.8); a view whose
// content comes from the API replaces them once that content has loaded.
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home.vue'),
      meta: {
        title: 'Learn any subject through video lessons',
        description:
          'Discover clear, engaging video lessons in maths, science, programming, history, languages and more. Free to watch, easy to save, and made for learning at your own pace.'
      }
    },
    {
      path: '/browse',
      name: 'browse',
      component: () => import('@/pages/Browse.vue'),
      meta: {
        title: 'Browse every lesson',
        description:
          'Search the full LearnStream catalog and filter lessons by subject, upload date, popularity and rating.'
      }
    },
    {
      path: '/subjects/:slug',
      name: 'subject',
      component: () => import('@/pages/Browse.vue'),
      meta: {
        title: 'Lessons by subject',
        description: 'Every lesson LearnStream holds for this subject, newest first.'
      }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/Browse.vue'),
      meta: {
        title: 'Search lessons',
        description: 'Find lessons by title, description, uploader, subject or tag.'
      }
    },
    {
      path: '/watch/:id',
      name: 'watch',
      component: () => import('@/pages/Watch.vue'),
      meta: {
        requiresAuth: true,
        title: 'Watch a lesson',
        description: 'Watch this lesson on LearnStream, with its description, uploader and views.'
      }
    },
    {
      path: '/saved',
      name: 'saved',
      component: () => import('@/pages/Saved.vue'),
      meta: {
        requiresAuth: true,
        title: 'Saved lessons',
        description: 'The lessons you kept for later study.'
      }
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('@/pages/Upload.vue'),
      meta: {
        requiresAuth: true,
        title: 'Upload a lesson',
        requiresAdmin: true,
        description: 'Publish a video lesson with a title, a description, a subject and tags.'
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        title: 'Your dashboard',
        description: 'Your lessons, their views, likes and dislikes, and your account.'
      }
    },
    {
      path: '/inbox',
      name: 'inbox',
      component: () => import('@/pages/Inbox.vue'),
      meta: {
        requiresAuth: true,
        requiresStaff: true,
        title: 'Inbox',
        description: 'Your students’ questions, and your replies, in one place.'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Auth.vue'),
      meta: {
        title: 'Sign in',
        description: 'Sign in to like, save and upload lessons on LearnStream.'
      }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/pages/Auth.vue'),
      meta: {
        title: 'Create your account',
        description: 'Join LearnStream to like, save and upload video lessons.'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFound.vue'),
      meta: {
        title: 'Page not found',
        description: 'That page does not exist on LearnStream.'
      }
    }
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// Saving, uploading, the dashboard and the inbox belong to an account
// (design_spec.md §4.7, §4.9). A visitor without one is sent to sign in, and
// lands where they were headed once they have an account. A page only staff may
// open sends anyone who cannot answer chat back to the home page.
router.beforeEach((to) => {
  if (!to.meta.requiresAuth || user.value) {
    if (to.meta.requiresAdmin && !canUpload.value) return { name: 'home' }
    if (to.meta.requiresStaff && !isStaff.value) return { name: 'home' }
    return true
  }
  return { name: 'login', query: { redirect: to.fullPath } }
})

// Title and description for the route that is now on screen. This runs before
// the view renders, so a view with content of its own can overwrite it later.
router.afterEach((to) => {
  applyRouteMeta(to.meta)
})
