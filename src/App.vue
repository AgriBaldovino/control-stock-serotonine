<template>
  <v-app>
    <v-main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </v-main>
  </v-app>
</template>

<style>
body {
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

.v-application {
  background: #f5f5f5 !important;
}
</style>
