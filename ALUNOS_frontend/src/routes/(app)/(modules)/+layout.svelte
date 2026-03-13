<script>
    // @ts-nocheck
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { invalidate } from '$app/navigation';
	import { languageChangedTemp } from '$lib/runes/lang.rune.svelte';
	import { sidebarRune } from '$lib/runes/sidebar.rune.svelte';
    
    
    /** @type {{data: import('./$types').LayoutData, children?: import('svelte').Snippet}} */
    let { data = $bindable(), children } = $props();

    let titulo_sidebar = $state("")

    $effect(() => {
        if(sidebarOptions.currentModule != titulo_sidebar){
            sidebarRune.areas = false
            data.sidebar_areas = false
            titulo_sidebar = sidebarOptions.currentModule
        }
    });

    // Sidebar estática baseada nos dados do layout server (sem chamadas à API)
</script>

<svelte:head>
</svelte:head>

<div class="app-body">   
        <!-- Sidebar -->
        <Sidebar areas={data.sidebar_areas} modulos={data.sidebar_modulos} id_objeto={0} titulo={titulo_sidebar}/>

    {#if !$navigating && !languageChangedTemp.bool}
        <div class="main" in:fade={{ duration: 300 }}>
            {@render children?.()}
        </div>
    {:else}
        <div class="main">
            <div id="loading-on">
                <span class="dot-on">.</span>
                <span class="dot-on2">.</span>
                <span class="dot-on3">.</span>
            </div>
        </div>
    {/if}
</div>