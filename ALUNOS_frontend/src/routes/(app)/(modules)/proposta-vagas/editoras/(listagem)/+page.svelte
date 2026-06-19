<script>
	import { locale, t } from "$lib/translations/translations";
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageIds } from '$lib/js/pageIds.conf';
    import Breadcrum from "$lib/components/Breadcrum.svelte";
    import * as dt_pt from '$lib/translations/pt/datatables.json';
    import * as dt_en from '$lib/translations/en/datatables.json';
	import { onMount, onDestroy } from "svelte";
	import { invalidate } from "$app/navigation";
	import { browser } from "$app/environment";
	import toastr from "toastr";

	// titulo da página
	pageTitle.title = $t("exemplos_editoras.titulo_pagina")

	// designação do módulo e objetos abertos
	sidebarOptions.currentModule = $t("exemplos_editoras.modulo");
	sidebarOptions.currentObject = $t("exemplos_editoras.objeto");
	sidebarOptions.currentModuleId = pageIds.exemplos.editoras.moduleId;
	sidebarOptions.currentObjectId = pageIds.exemplos.editoras.objectId;
    
	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
	
	/** * @type {any} */
	let el // table element
	/** * @type {any}  */
	let table // table object (API)


	onMount(async () => {
		/** * @type {{ title: string }[]} */
		let colunas = [];

		data.editoras.forEach(function (/** @type {{}} */ p, /** @type {number} */ idx) {
			if (idx == 0) {
				Object.keys(p).forEach(function (c, i) {
					colunas.push({
						title: $t(`exemplos_editoras.tbl.${c}`)
					});
				});
			}
		});
		colunas.push({
			title: $t(`exemplos_editoras.tbl.detalhe`)
		},{
			title: $t(`exemplos_editoras.tbl.eliminar`)
		});

		// @ts-ignore
		table = jQuery(el).DataTable({
			dom: 'Bfrtip',
			responsive: true,
			buttons: [
				'pageLength',
				'pdf',
				'csv',
				'excel',
				'copy',
				'colvis'
			],
			'pageLength': 25,
			'order': [[ 0, 'desc' ]],
			'columns': colunas,
			'columnDefs': [
				{ 'visible': true, 'targets': [1] },
				{
					targets: [0], // Logotipo
					orderable: false,
					className: "dt-body-center",
					render: function(/** @type {any} */ data, /** @type {any} */ type, /** @type {any} */ row){
						return `<img src='/ep/proposta-vagas/editoras/getLogotipo/${row[0]}' alt='Logótipo' style="max-width: 100px; max-height: 100px;"/>`
					}
				},
				{
					targets: [-2], // Detalhes
					orderable: false,
					className: "dt-body-center",
					render: function(/** @type {any} */ data, /** @type {any} */ type, /** @type {any} */ row){
						return `<a href='/proposta-vagas/editoras/${row[0]}' class="btn btn-sm btn-outline-info" aria-label="Ver detalhe"><i class="fas fa-external-link-alt" aria-hidden="true"></i></a>`
					}
				}, {
					targets: [-1], // Eliminar
					orderable: false,
					className: "dt-body-center",
					render: function(/** @type {any} */ data, /** @type {any} */ type, /** @type {any} */ row){
						return `<button data-id_editora='${row[0]}' class="eliminar_editora btn btn-sm btn-outline-danger" aria-label="Eliminar editora"><i class="fas fa-trash" aria-hidden="true"></i></button>`
					}
				}
			],
			'drawCallback': function () {
				jQuery('.datatable-on').parent().removeClass('container-fluid');
				jQuery('#loading_area').css('display', 'none');
				jQuery('#modulepage_content').fadeIn(600);
				setTimeout(function(){
					table.columns.adjust().responsive.recalc()
				}, 100)
			},
			"language": (locale.get() == "pt" ? dt_pt : dt_en)
		})

		data.editoras.forEach((/** @type {ArrayLike<any> | { [s: string]: any; }} */ el) => {
			const valores = Object.values(el);
				// @ts-ignore
			table.row.add([...valores, null, null]);
		})
		table.draw()

		if(!data.editoras.length) {
			jQuery('#conteudo_carregado').css('display', 'none');
			jQuery('#loading_area').css('display', 'none');
			jQuery('#sem_dados').css('display', 'block');
			jQuery('#btn_filtros').removeClass('disabled').prop('disabled', false);
		}


		jQuery(document).on("click.editoras", ".eliminar_editora", async function(){
			if (!window.confirm($t("exemplos_editoras.confirmar_eliminar"))) return;

			let queryString = '?';
			queryString += 'id_editora=' + jQuery(this).data("id_editora");

			let promise = await fetch(`/ep/proposta-vagas/editoras/eliminar${queryString}`)
			if(promise.status == 200) {
				let res = await promise.json()
				if(res.success){
					toastr.success($t("exemplos_editoras.toastr.sucesso"), $t("exemplos_editoras.toastr.form_sucesso"), { timeOut: 5000, progressBar: true })
					invalidate("exemplos:editoras");
				} else {
					toastr.error($t("exemplos_editoras.toastr.erro"), $t("exemplos_editoras.toastr.form_erro"), { timeOut: 5000, progressBar: true })
				}
			} else {
				toastr.error($t("exemplos_editoras.toastr.erro"), $t("exemplos_editoras.toastr.form_erro"), { timeOut: 5000, progressBar: true })
			}
		})
		
	});


	// dados das editoras recarregados pelo invalidate, effect corre automaticamente, re-preencher tabela
	$effect(() => {
		if(data.editoras.length){
			if (table && table != undefined) {
				// @ts-ignore
				table.clear();
				
				data.editoras.forEach((/** @type {ArrayLike<any> | { [s: string]: any; }} */ el) => {
					const valores = Object.values(el);
					// @ts-ignore
					table.row.add([...valores, null, null]);
				});
				// @ts-ignore
				table.draw();
			}
		} else {
			jQuery('.datatable-on').parent().removeClass('container-fluid');
			jQuery('#modulepage_content').css("display", "none");
			jQuery('#sem_dados').css("display", "block");
		}
	})


	onDestroy(() => {
		if (!browser) return;
		jQuery(document).off("click.editoras");
		if (table) {
			// @ts-ignore
			table.destroy();
			table = null;
		}
	});

	let items_breadcrum = $derived([{icon_class: "icon-doc", url: "/proposta-vagas/editoras/nova", designacao: $t("exemplos_editoras.nova")}])
</script>

<style>
    @import "./editoras.css";
</style>


<div>
	<Breadcrum modulo={sidebarOptions.currentModule} objeto={sidebarOptions.currentObject} menu_items={items_breadcrum}/>

	<div class="p-2">
		<div id="conteudo_carregado">
			<div class="row" id="modulepage_content" style="display: none">
				<div class="table-responsive p-3">
					<table id="tbl" bind:this={el} class="datatable-on table-striped hover datatable table-sm nowrap no-footer dtr-inline">
						<tbody></tbody>
					</table>
				</div>
			</div>
		</div>
		<div id="loading_area">
			<div id="loading-on">
				<span class="dot-on">.</span>
				<span class="dot-on2">.</span>
				<span class="dot-on3">.</span>
			</div>
		</div>
		<div id="sem_dados" style="display: none">
			<p>{$t('exemplos_editoras.sem_dados')}</p>
		</div>
	</div>

</div>