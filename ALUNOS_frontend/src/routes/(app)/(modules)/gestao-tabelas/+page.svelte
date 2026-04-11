<script>
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from "$lib/components/Breadcrum.svelte";
	import { invalidateAll } from '$app/navigation';
	import toastr from "toastr";

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	/** @typedef {{ anoInicio: number, anoFim: number, label: string, totalCursos: number, temDados: boolean }} AnoItem */
	/** @type {AnoItem[]} */
	let anos = $derived(data.anos ?? []);

	$effect(() => {
		sidebarOptions.currentModule = 'Proposta de Vagas';
		sidebarOptions.currentModuleId = 1;
		sidebarOptions.currentObject = 'Gestão de Tabelas';
		sidebarOptions.currentObjectId = 99;
		pageTitle.title = 'Gestão de Tabelas';
	});



	let modalVisible = $state(false);
	/** @type {'reset' | 'delete' | null} */
	let modalAction = $state(null);
	/** @type {AnoItem | null} */
	let modalAno = $state(null);
	let modalLoading = $state(false);

	/** @param {AnoItem} ano @param {'reset' | 'delete'} action */
	function openModal(ano, action) {
		modalAno = ano;
		modalAction = action;
		modalVisible = true;
		modalLoading = false;
	}

	function closeModal() {
		modalVisible = false;
		modalAno = null;
		modalAction = null;
		modalLoading = false;
	}

	async function confirmarAcao() {
		if (!modalAno || !modalAction) return;
		modalLoading = true;
		try {
			let res;
			if (modalAction === 'delete') {
				res = await fetch(`/api/vagas/ano/${modalAno.anoInicio}`, { method: 'DELETE' });
			} else {
				res = await fetch(`/api/vagas/ano/${modalAno.anoInicio}/reset`, { method: 'PUT' });
			}

			if (!res.ok) {
				const txt = await res.text();
				console.error('Erro:', txt);
				toastr.error('Ocorreu um erro ao executar a operação.', 'ERRO', { timeOut: 5000 });
				modalLoading = false;
				return;
			}

			const msg = modalAction === 'delete'
				? `Ano ${modalAno.label} apagado com sucesso!`
				: `Dados do ano ${modalAno.label} limpos com sucesso!`;
			toastr.success(msg, 'SUCESSO', { timeOut: 5000, progressBar: true });
			closeModal();
			await invalidateAll();
		} catch (e) {
			console.error(e);
			toastr.error('Erro de comunicação com o servidor.', 'ERRO', { timeOut: 5000 });
			modalLoading = false;
		}
	}
</script>

<Breadcrum modulo="Proposta de Vagas" objeto="Gestão de Tabelas" />

<div class="container-fluid" style="padding: 24px;">
	<div class="table-wrapper">
		{#if anos.length === 0}
			<div class="text-center text-muted py-5">
				<i class="fa fa-info-circle fa-2x mb-2"></i>
				<p>Não existem anos letivos na base de dados.</p>
			</div>
		{:else}
			<table class="gestao-table">
				<thead>
					<tr>
						<th class="header-main" colspan="4">Gestão de Tabelas (Anos Letivos)</th>
					</tr>
					<tr>
						<th class="header-col">Ano Letivo</th>
						<th class="header-col">N.º Cursos</th>
						<th class="header-col">Estado</th>
						<th class="header-col">Ações</th>
					</tr>
				</thead>
				<tbody>
					{#each anos as ano, idx (ano.anoInicio)}
						<tr class={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
							<td class="td-ano">{ano.label}</td>
							<td>{ano.totalCursos}</td>
							<td>
								{#if ano.temDados}
									<span class="badge-com-dados">Com dados</span>
								{:else}
									<span class="badge-zerada">Sem dados</span>
								{/if}
							</td>
							<td class="td-acoes">
								<button
									type="button"
									class="btn-limpar"
									onclick={() => openModal(ano, 'reset')}
								>
									<i class="fa fa-eraser mr-1"></i> Limpar dados
								</button>
								<button
									type="button"
									class="btn-apagar"
									onclick={() => openModal(ano, 'delete')}
								>
									<i class="fa fa-trash mr-1"></i> Apagar ano
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<div class="notas">
		<i class="fa fa-info-circle mr-1"></i>
		<strong>Limpar dados</strong> — coloca todos os valores numéricos a 0, mas mantém a estrutura (cursos e ano letivo).
		<br/>
		<i class="fa fa-exclamation-triangle mr-1" style="color: #c0392b;"></i>
		<strong>Apagar ano</strong> — remove completamente o ano letivo e todos os dados associados. Esta operação é irreversível.
	</div>
</div>

{#if modalVisible && modalAno}
	<div class="modal d-block modal-gestao-confirm" tabindex="-1" role="dialog" aria-modal="true">
		<div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 520px; width: 90%;">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">
						{#if modalAction === 'delete'}
							Confirmar eliminação
						{:else}
							Confirmar limpeza de dados
						{/if}
					</h5>
					<button type="button" class="close" aria-label="Fechar" onclick={closeModal} disabled={modalLoading}>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>

				<div class="modal-body">
					{#if modalAction === 'delete'}
						<p>Tem a certeza que deseja <strong class="text-danger">apagar permanentemente</strong> o ano letivo <strong>{modalAno.label}</strong>?</p>
						<p class="small text-muted mb-0">
							Serão eliminados todos os dados associados ({modalAno.totalCursos} cursos). Esta operação é irreversível.
						</p>
					{:else}
						<p>Tem a certeza que deseja <strong class="text-warning">limpar todos os dados</strong> do ano letivo <strong>{modalAno.label}</strong>?</p>
						<p class="small text-muted mb-0">
							Todos os valores numéricos serão colocados a 0. A estrutura de cursos será mantida.
						</p>
					{/if}
				</div>

				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						onclick={closeModal}
						disabled={modalLoading}
					>
						Cancelar
					</button>
					<button
						type="button"
						class="btn {modalAction === 'delete' ? 'btn-danger' : 'btn-warning'}"
						onclick={confirmarAcao}
						disabled={modalLoading}
					>
						{#if modalLoading}
							<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
							A processar...
						{:else if modalAction === 'delete'}
							<i class="fa fa-trash mr-1"></i> Apagar
						{:else}
							<i class="fa fa-eraser mr-1"></i> Limpar dados
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.table-wrapper {
		border-radius: 4px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
		background: #fff;
	}
	.gestao-table {
		border-collapse: collapse;
		width: 100%;
		font-size: 13px;
		background-color: #ffffff;
	}
	.gestao-table th,
	.gestao-table td {
		border: 1px solid #dde3f0;
		padding: 10px 14px;
		text-align: center;
		vertical-align: middle;
	}
	.header-main {
		background: linear-gradient(to right, #0d6efd, #0b5ed7);
		color: #fff;
		font-weight: 700;
		font-size: 14px;
		padding: 12px 14px;
	}
	.header-col {
		background-color: #e7f1ff;
		color: #0b5ed7;
		font-weight: 600;
		font-size: 12px;
	}
	.row-even {
		background-color: #ffffff;
	}
	.row-odd {
		background-color: #f8f9ff;
	}
	.gestao-table tbody tr:hover {
		background-color: #eef2ff;
	}
	.td-ano {
		font-weight: 700;
		font-size: 14px;
	}
	.td-acoes {
		white-space: nowrap;
	}
	.btn-limpar, .btn-apagar {
		display: inline-block;
		padding: 4px 12px;
		font-size: 11px;
		font-weight: 500;
		border: 1px solid;
		border-radius: 3px;
		cursor: pointer;
		background: transparent;
		transition: all 0.15s ease;
	}
	.btn-limpar {
		color: #e67e22;
		border-color: #e67e22;
		margin-right: 6px;
	}
	.btn-limpar:hover {
		background-color: #e67e22;
		color: #fff;
	}
	.btn-apagar {
		color: #c0392b;
		border-color: #c0392b;
	}
	.btn-apagar:hover {
		background-color: #c0392b;
		color: #fff;
	}
	.badge-com-dados, .badge-zerada {
		display: inline-block;
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 600;
		border-radius: 10px;
		letter-spacing: 0.3px;
	}
	.badge-com-dados {
		background-color: #e8f5e9;
		color: #2e7d32;
	}
	.badge-zerada {
		background-color: #fff3e0;
		color: #e65100;
	}
	.notas {
		margin-top: 14px;
		font-size: 12px;
		color: #6c757d;
		line-height: 1.8;
	}
	.modal-gestao-confirm {
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		width: 100%;
	}
	.modal-gestao-confirm .modal-dialog {
		margin: 0 auto;
	}
</style>
