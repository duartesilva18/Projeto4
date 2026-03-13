<script>
	import { page } from '$app/stores';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
    import { t } from '$lib/translations/translations';
	import { setupTranslations } from './Sidebar_translations';
     
    /** @type {{areas?: any[] | false | null, modulos?: any[] | false | null, titulo?: string | null}} */
    let { areas, modulos, titulo } = $props();

    if(Array.isArray(areas) && areas.length === 0) areas = false;

    $effect(() => {
        setupTranslations(modulos, areas);
    });

    let idx_area = $state(0);
    /** * @param {number} id */
    function changeObject(id){
        if(areas && Array.isArray(areas))
            areas.forEach((area, idx_a) => {
                if(area.hasOwnProperty("objetos") && area.objetos.length){
                    area.objetos.forEach((/** @type {any} */ obj, /** @type {number} */ idx) => {
                        if(obj.id_objeto == id){
                            idx_area = idx_a;
                            return 2;
                        }
                    })
                }
            });
    }
    $effect(() => {
        changeObject(sidebarOptions.currentObjectId);
    });

</script>

<link rel="stylesheet" href="/internal/css/module_sidebar.css">

<div class="sidebar">
  <nav class="sidebar-nav">
    <ul class="nav">
        <li class="nav-title">
            {$t("sidebar.modulo")}
            <div style="font-weight: bolder;"><a id="link-module-dashboard" href="#">{@html titulo || "<br>"}</div>
        </li>
        
        {#if !areas && areas === null || (Array.isArray(areas) && areas.length === 0)}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#">{$t("sidebar.sem_opcs")}</a>
            </li>
        {:else if !areas && areas === false}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#">{$t("sidebar.a_carregar")}</a>
            </li>
        {:else if Array.isArray(areas)}
            {#each areas as area, idx}
                {#if area.ativo}
                <li class="nav-item nav-dropdown nav-item-module-title {idx == idx_area ? 'open' : ''}">
                    <a class="nav-link nav-dropdown-toggle" href="#"><b>{$t("sidebar_dyn.area_" + area.id_area)}</b></a>
                    <ul class="nav-dropdown-items striped-list {idx == idx_area ? 'show' : ''}">
                        {#if area.hasOwnProperty("objetos") && area.objetos.length}
                            {#each area.objetos as obj}
                                {#if obj.item_menu && obj.ativo}
                                <li class="nav-item nav-item-module" style="padding: 0; margin: 0; overflow-y: hidden;">
                                    <a href="{obj.ficheiro || "#"}" class="nav-link link-other-modules {obj.id_objeto == sidebarOptions.currentObjectId ? 'active' : ''}"  data-sveltekit-preload-data="off" data-version=""><i class="fa fa-circle dot-op-module"></i> {$t("sidebar_dyn.obj_" + obj.id_objeto)} {#if obj.hasOwnProperty("beta") && obj.beta}<span class="badge badge-info">Beta</span>{/if}</a>
                                </li>
                                {/if}
                            {/each}
                        {/if}
                    </ul>
                </li>
                {/if}
            {/each}
        {:else}
            <li class="nav-item nav-dropdown nav-item-module-title open">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#">{$t("sidebar.sem_opcs")}</a>
            </li>
        {/if}

        <li style="height: 20px;"></li>

        {#if !modulos && modulos === null || Array.isArray(modulos) && modulos.length === 0 || !Array.isArray(modulos)}
            <li class="nav-item nav-dropdown nav-item-module-title2">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#"><b>{$t("sidebar.outros")}</b> {$t("sidebar.modulos")}</a>
                <ul class="nav-dropdown-items striped-list">
                    <li class="nav-item nav-item-secondary" style="padding: 0; margin: 0; overflow-y: hidden;">
                        <a href="#" class="nav-link link-other-modules" data-version=""><i class="fa fa-user dot-op-module"></i> {$t("sidebar.sem_opcs")}</a>
                    </li>   
                </ul>
            </li>
        {:else if !modulos && (modulos === false)}
            <li class="nav-item nav-dropdown nav-item-module-title2">
            <a class="nav-link nav-dropdown-toggle nav-title" href="#"><b>{$t("sidebar.outros")}</b> {$t("sidebar.modulos")}</a>
            <ul class="nav-dropdown-items striped-list">
                <li class="nav-item nav-item-secondary" style="padding: 0; margin: 0; overflow-y: hidden;">
                    <a href="#" class="nav-link link-other-modules" data-version=""><i class="fa fa-user dot-op-module"></i> {$t("sidebar.a_carregar")}</a>
                </li>   
            </ul>
        </li>
        {:else}
            <li class="nav-item nav-dropdown nav-item-module-title2">
                <a class="nav-link nav-dropdown-toggle nav-title" href="#"><b>{$t("sidebar.outros")}</b> {$t("sidebar.modulos")}</a>
                <ul class="nav-dropdown-items striped-list">
                    {#each modulos as modulo}
                        {#if modulo.ativo && !$page.url.pathname.includes(modulo.link || "#")}
                            <li class="nav-item nav-item-secondary" style="padding: 0; margin: 0; overflow-y: hidden;">
                                <a href="{modulo.link || "#"}" class="nav-link link-other-modules" data-sveltekit-preload-data="off" data-version=""><i class="fa fa-user dot-op-module"></i> {$t("sidebar_dyn.mod_" + modulo.id_modulo) || "."} {#if modulo.hasOwnProperty("beta") && modulo.beta}<span class="badge badge-info">Beta</span>{/if}</a>
                            </li> 
                        {/if}  
                    {/each}
                </ul>
            </li>
        {/if}
    </ul>
  </nav>
</div>