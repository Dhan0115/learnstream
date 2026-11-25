// Run after building Nitro: node --test tests/video-management.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { PrismaClient } from '@prisma/client'

test('video management enforces ownership and preserves unrelated lessons', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'learnstream-management-'))
  const dbFile = join(dir, 'fixture.db')
  const env = { ...process.env, DATABASE_URL: `file:${dbFile}`, MEDIA_DIR: dir,
    NITRO_HOST: '127.0.0.1', NITRO_PORT: '0', CHECKPOINT_DISABLE: '1' }
  const schema = new DatabaseSync(dbFile)
  schema.exec(execFileSync('node_modules/.bin/prisma', ['migrate', 'diff', '--from-empty',
    '--to-schema-datamodel', 'prisma/schema.prisma', '--script'], { encoding: 'utf8', env }))
  schema.close()
  const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL })
  const server = spawn(process.execPath, ['.output/server/index.mjs'], { env, stdio: ['ignore', 'pipe', 'inherit'] })
  t.after(async () => {
    if (server.exitCode === null && !server.signalCode) {
      const closed = once(server, 'exit')
      server.kill()
      await closed
    }
    await db.$disconnect()
    await rm(dir, { recursive: true, force: true })
  })
  let base
  for await (const chunk of server.stdout) {
    base = chunk.toString().match(/Listening on (http:\/\/127\.0\.0\.1:\d+)/)?.[1]
    if (base) break
  }
  assert.ok(base, 'test server started')
  for (const [id, role] of [['owner','teacher'], ['other','teacher'], ['student','learner'], ['admin','admin']]) {
    await db.user.create({ data: { id, name: id, email: `${id}@example.invalid`, role, passwordHash: '-',
      sessions: { create: { id, expiresAt: new Date(Date.now() + 60000) } } } })
  }
  await db.subject.create({ data: { id: 'math', slug: 'math', name: 'Math', icon: 'M', tagline: 'Math' } })
  await t.test('public signup creates a learner account', async () => {
    const response = await fetch(`${base}/api/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'New learner', email: 'new@example.invalid', password: 'test-only-passphrase' })
    })
    assert.ok(response.ok)
    assert.equal((await response.json()).user.role, 'learner')
  })
  await t.test('only admins reach upload file validation', async () => {
    for (const [actor, expected] of [[null, 401], ['student', 403], ['owner', 403], ['admin', 400]]) {
      const response = await fetch(`${base}/api/videos`, {
        method: 'POST', headers: actor ? { cookie: `learnstream_session=${actor}` } : {}
      })
      assert.equal(response.status, expected, `upload permission: ${actor}`)
    }
  })
  for (const id of ['lesson', 'second', 'untouched']) {
    await db.video.create({ data: { id, title: 'Original', description: 'Original description', subjectId: 'math',
      status: 'published', uploaderId: 'owner', metadata: { create: { storageKey: `${id}.mp4` } } } })
    await writeFile(join(dir, `${id}.mp4`), 'fixture')
  }
  const details = { title: 'Updated lesson', description: 'Updated description', subjectSlug: 'math', tags: ['Practice'] }
  function call(method, actor, id = 'lesson', body = details) {
    return fetch(`${base}/api/videos/${id}`, { method,
      headers: { 'content-type': 'application/json', ...(actor ? { cookie: `learnstream_session=${actor}` } : {}) },
      body: method === 'PUT' ? JSON.stringify(body) : undefined })
  }
  for (const method of ['PUT', 'DELETE']) {
    for (const [actor, expected] of [[null, 401], ['other', 403], ['student', 403]]) {
      assert.equal((await call(method, actor)).status, expected, `${method} ${actor}`)
    }
    assert.equal((await call(method, 'admin', 'missing')).status, 404)
  }
  assert.equal((await call('PUT', 'owner', 'lesson', { ...details, uploaderId: 'other' })).status, 400)
  assert.equal((await call('PUT', 'owner', 'lesson', { ...details, subjectSlug: 'missing' })).status, 400)
  assert.equal((await db.video.findUniqueOrThrow({ where: { id: 'lesson' } })).title, 'Original')
  for (const [id, actor] of [['lesson', 'owner'], ['second', 'admin']]) {
    const res = await call('PUT', actor, id)
    assert.equal(res.status, 200)
    assert.deepEqual((await res.json()).video.tags, details.tags)
    assert.equal((await call('GET', null, id)).status, 401)
    assert.equal((await (await call('GET', 'student', id)).json()).video.title, details.title)
    assert.equal((await fetch(`${base}/media/${id}.mp4`)).status, 401)
    assert.equal((await fetch(`${base}/media/${id}.mp4`, { headers: { cookie: 'learnstream_session=student' } })).status, 200)
    assert.equal((await call('DELETE', actor, id)).status, 204)
    assert.equal((await call('GET', 'student', id)).status, 404)
    assert.equal((await fetch(`${base}/media/${id}.mp4`)).status, 404)
  }
  assert.equal(await db.video.count(), 1)
  assert.equal((await call('GET', 'student', 'untouched')).status, 200)
})
