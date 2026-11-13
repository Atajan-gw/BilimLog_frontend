<script setup>
import AppHeader from '@/components/AppHeader.vue'
import { auth } from '@/lib/auth'
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="mx-auto max-w-xl px-5 py-10">
      <section class="rounded-3xl bg-surface p-6 shadow-sm">
        <h2 class="text-2xl font-extrabold">{{ auth.user?.name }} {{ auth.user?.surname }}</h2>
        <dl class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between gap-4 border-b border-sand pb-3">
            <dt class="text-ink/60">Username</dt>
            <dd class="font-semibold">{{ auth.user?.username }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-sand pb-3">
            <dt class="text-ink/60">Phone Number</dt>
            <dd class="font-semibold">{{ auth.user?.phone_number }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-ink/60">Role</dt>
            <dd class="font-semibold">{{ auth.user?.role }}</dd>
          </div>
        </dl>
        <p v-if="auth.user?.role === 'admin'" class="mt-5 rounded-2xl bg-paper px-4 py-3 text-sm text-ink/70">
          Admin dashboard is accessed from the admin web panel. This page is intended for teachers and students.
        </p>
      </section>
    </main>
  </div>
</template>
