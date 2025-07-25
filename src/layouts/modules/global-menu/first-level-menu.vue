<script setup lang="ts">
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { SimpleScrollbar } from '@yuencode/materials';
import { transformColorWithOpacity } from '@yuencode/utils';
import { useAppStore } from '@/store/modules/app';
import { useRouteStore } from '@/store/modules/route';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({
  name: 'FirstLevelMenu'
});

interface Props {
  activeMenuKey?: string;
  inverted?: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'select', menu: App.Global.Menu): boolean;
}

const emit = defineEmits<Emits>();

const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();

interface MixMenuItemProps {
  /** Menu item label */
  label: App.Global.Menu['label'];
  /** Menu item icon */
  icon: App.Global.Menu['icon'];
  /** Active menu item */
  active: boolean;
  /** Mini size */
  isMini: boolean;
}
const [DefineMixMenuItem, MixMenuItem] = createReusableTemplate<MixMenuItemProps>();

const selectedBgColor = computed(() => {
  const { darkMode, themeColor } = themeStore;

  const light = transformColorWithOpacity(themeColor, 0.1, '#ffffff');
  const dark = transformColorWithOpacity(themeColor, 0.3, '#000000');

  return darkMode ? dark : light;
});

function handleClickMixMenu(menu: App.Global.Menu) {
  emit('select', menu);
}
</script>

<template>
  <!-- define component: MixMenuItem -->
  <DefineMixMenuItem v-slot="{ label, icon, active, isMini }">
    <div
      class="flex-vertical-center mx-4px mb-6px py-8px px-4px rounded-8px bg-transparent transition-300 cursor-pointer hover:bg-[rgb(0,0,0,0.08)]"
      :class="{
        'text-primary selected-mix-menu': active,
        'text-white:65 hover:text-white': inverted,
        '!text-white !bg-primary': active && inverted
      }"
    >
      <component :is="icon" :class="[isMini ? 'text-icon-small' : 'text-icon-large']" />
      <p
        class="w-full text-center ellipsis-text text-12px transition-height-300"
        :class="[isMini ? 'h-0 pt-0' : 'h-24px pt-4px']"
      >
        {{ label }}
      </p>
    </div>
  </DefineMixMenuItem>

  <!-- template -->
  <div class="flex-1-hidden flex-vertical-stretch h-full">
    <slot></slot>
    <SimpleScrollbar>
      <MixMenuItem
        v-for="menu in routeStore.menus"
        :key="menu.key"
        :label="menu.label"
        :icon="menu.icon"
        :active="menu.key === activeMenuKey"
        :is-mini="appStore.siderCollapse"
        @click="handleClickMixMenu(menu)"
      />
    </SimpleScrollbar>
    <MenuToggler
      arrow-icon
      :collapsed="appStore.siderCollapse"
      :class="{ 'text-white:88 !hover:text-white': inverted }"
      @click="appStore.toggleSiderCollapse"
    />
  </div>
</template>

<style scoped>
.selected-mix-menu {
  background-color: v-bind(selectedBgColor);
}
</style>
