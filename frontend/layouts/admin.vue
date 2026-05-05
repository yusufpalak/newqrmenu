<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside :class="`fixed inset-y-0 left-0 bg-slate-900 shadow-xl z-50 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`">
      <!-- Logo -->
      <div class="p-5 border-b border-white/10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3" v-if="sidebarOpen">
            <div class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <p class="text-white font-semibold text-sm">DineX</p>
              <p class="text-slate-400 text-xs">Admin Panel</p>
            </div>
          </div>
          <div v-else class="w-9 h-9 mx-auto bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Tenant badge -->
      <div v-if="authStore.currentTenant" v-show="sidebarOpen" class="mx-3 mt-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
        <p class="text-xs text-slate-400">Aktif Restoran</p>
        <p class="text-sm font-medium text-white truncate">{{ authStore.currentTenant.name }}</p>
      </div>
      <div v-else-if="authStore.isSuperAdmin" v-show="sidebarOpen" class="mx-3 mt-3 px-3 py-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <p class="text-xs text-amber-400">Global Mod</p>
        <p class="text-xs text-amber-300 mt-0.5">Tenant seçilmedi</p>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto mt-4 space-y-0.5 pb-4" :class="sidebarOpen ? 'px-3' : 'px-2'">
        <NuxtLink to="/admin/dashboard" :class="[isActive('/admin/dashboard') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Ana Sayfa' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span v-show="sidebarOpen">Ana Sayfa</span>
        </NuxtLink>

        <div v-show="sidebarOpen" class="pt-3 pb-1 px-3">
          <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Menü</p>
        </div>

        <NuxtLink to="/admin/categories" :class="[isActive('/admin/categories') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Kategoriler' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span v-show="sidebarOpen">Kategoriler</span>
        </NuxtLink>

        <NuxtLink to="/admin/sub-categories" :class="[isActive('/admin/sub-categories') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Alt Kategoriler' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span v-show="sidebarOpen">Alt Kategoriler</span>
        </NuxtLink>

        <NuxtLink to="/admin/products" :class="[isActive('/admin/products') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Ürünler' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span v-show="sidebarOpen">Ürünler</span>
        </NuxtLink>

        <div v-show="sidebarOpen" class="pt-3 pb-1 px-3">
          <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Pazarlama</p>
        </div>

        <NuxtLink to="/admin/banners" :class="[isActive('/admin/banners') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Kampanya Bannerı' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span v-show="sidebarOpen">Kampanya Bannerı</span>
        </NuxtLink>

        <NuxtLink to="/admin/analytics" :class="[isActive('/admin/analytics') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'QR Analitik' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span v-show="sidebarOpen">QR Analitik</span>
        </NuxtLink>

        <div v-show="sidebarOpen" class="pt-3 pb-1 px-3">
          <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Yönetim</p>
        </div>

        <NuxtLink to="/admin/users" :class="[isActive('/admin/users') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Kullanıcılar' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span v-show="sidebarOpen">Kullanıcılar</span>
        </NuxtLink>

        <NuxtLink to="/admin/currencies" :class="[isActive('/admin/currencies') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Para Birimleri' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span v-show="sidebarOpen">Para Birimleri</span>
        </NuxtLink>

        <NuxtLink to="/admin/translation-requests" :class="[isActive('/admin/translation-requests') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Çeviriler' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span v-show="sidebarOpen">Çeviriler</span>
        </NuxtLink>

        <NuxtLink to="/admin/qr-code" :class="[isActive('/admin/qr-code') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'QR Kod' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span v-show="sidebarOpen">QR Kod</span>
        </NuxtLink>

        <NuxtLink to="/admin/settings" :class="[isActive('/admin/settings') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Ayarlar' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span v-show="sidebarOpen">Ayarlar</span>
        </NuxtLink>

        <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/tenants" :class="[isActive('/admin/tenants') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Tenantlar' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span v-show="sidebarOpen">Tenantlar</span>
        </NuxtLink>

        <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/blog" :class="[isActive('/admin/blog') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Blog' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <span v-show="sidebarOpen">Blog</span>
        </NuxtLink>

        <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/messages" :class="[isActive('/admin/messages') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5', 'flex items-center gap-3 rounded-lg transition text-sm font-medium', sidebarOpen ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center']" :title="!sidebarOpen ? 'Mesajlar' : ''">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span v-show="sidebarOpen">Mesajlar</span>
        </NuxtLink>
      </nav>

      <!-- Bottom: user + logout -->
      <div class="p-3 border-t border-white/10">
        <div class="flex items-center gap-3 px-2 py-2 mb-2" :class="sidebarOpen ? 'flex' : 'justify-center'">
          <div class="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-indigo-300 font-semibold text-sm">{{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
          </div>
          <div v-show="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ authStore.user?.name || '—' }}</p>
            <p class="text-xs text-slate-500 truncate">{{ authStore.user?.role }}</p>
          </div>
        </div>
        <button @click="authStore.logout()" :title="!sidebarOpen ? 'Çıkış Yap' : ''" :class="[sidebarOpen ? 'justify-start' : 'justify-center', 'w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition text-sm font-medium']">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-show="sidebarOpen">Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div :class="`transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-20'}`">
      <!-- Top bar -->
      <header class="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button @click="toggleSidebar()" class="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
              <svg v-if="sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div>
              <h2 class="text-lg font-bold text-slate-800">{{ pageTitle }}</h2>
              <p class="text-xs text-slate-400 mt-0.5">{{ pageSubtitle }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink
              v-if="authStore.currentTenant"
              :href="`/${authStore.currentTenant.slug}`"
              target="_blank"
              class="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-xs font-medium border border-slate-200"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Menüyü Aç
            </NuxtLink>
            <NuxtLink v-if="authStore.isSuperAdmin" to="/admin/select-tenant" class="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-700 shadow-sm rounded-lg transition text-xs font-medium">
              Restoran Değiştir
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-8 flex flex-col">
        <div class="flex-1">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' });

const authStore = useAuthStore();
const route = useRoute();

const sidebarOpen = ref(true);

const isActive = (path: string) => route.path === path;

const pageTitles = {
  '/admin/dashboard': ['Ana Sayfa', 'Genel bakış ve hızlı erişim'],
  '/admin/categories': ['Kategoriler', 'Menü kategorilerini yönet'],
  '/admin/sub-categories': ['Alt Kategoriler', 'Ana kategoriler altındaki gruplar'],
  '/admin/products': ['Ürünler', 'Menü ürünlerini yönet'],
  '/admin/users': ['Kullanıcılar', 'Kullanıcı hesaplarını yönet'],
  '/admin/currencies': ['Para Birimleri', 'Çoklu döviz fiyatlandırması'],
  '/admin/translation-requests': ['Çeviriler', 'Çeviri taleplerini yönet'],
  '/admin/qr-code': ['QR Kod', 'Restoran QR kodunu indir'],
  '/admin/settings': ['Ayarlar', 'Restoran ve sistem ayarları'],
  '/admin/tenants': ['Tenantlar', 'Restoran tenantlarını yönet'],
  '/admin/blog': ['Blog', 'Blog yazılarını yönet ve otomatik çeviri yap'],
  '/admin/messages': ['Mesajlar', 'İletişim formu mesajları'],
  '/admin/banners': ['Kampanya Bannerı', 'Kampanya banner\'larını yönet'],
  '/admin/analytics': ['QR Analitik', 'QR kod tarama analitiği'],
};

const pageTitle = computed(() => (pageTitles as any)[route.path]?.[0] || route.path.split('/').pop());
const pageSubtitle = computed(() => (pageTitles as any)[route.path]?.[1] || '');

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/admin/login');
  } else if (!authStore.user) {
    await authStore.fetchUser();
  }
});
</script>
