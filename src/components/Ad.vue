<template>
    <div v-if="visible" class="flex flex-col rounded-lg m-1 p-2 border gap-1">
        <div class="w-full flex justify-between items-center">
            <div class="font-semibold">{{ $t('cent-ad-title') }}</div>
            <button type="button" class="text-xs cursor-pointer" @click="close">{{ $t('cent-ad-close') }}</button>
        </div>
        <p class="text-sm">{{ $t('cent-ad-desc') }} <a class="underline" href="https://cent.linkai.work/"
                target="_blank" rel="noreferrer">{{ $t('cent-ad-try') }}</a></p>
    </div>
</template>
<script lang="ts" setup>
const key = 'new-cent-ad'
const visible = ref(!(localStorage.getItem(key)))
const close = () => {
    localStorage.setItem(key, `${Date.now()}`)
    visible.value = false
}
</script>