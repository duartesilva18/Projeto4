<script>
	import { sidebarOptions } from '$lib/runes/sidebarOptions.rune.svelte';
	import { pageTitle } from '$lib/runes/pageTitle.rune.svelte';
	import Breadcrum from "$lib/components/Breadcrum.svelte";
	import { invalidateAll } from '$app/navigation';
	import toastr from "toastr";

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	/** @typedef {{ anoInicio: number, anoFim: number, label: string, totalCursos: number, temDados: boolean, totalDadosInseridos: number, totalCamposDges: number, totalCursosDges: number }} AnoItem */
	/** @type {AnoItem[]} */
	let anos = $derived(data.anos ?? []);

	$effect(() => {
		sidebarOptions.currentModule = 'Proposta de Vagas';
		sidebarOptions.currentModuleId = 1;
		sidebarOptions.currentObject = 'Gestão de Tabelas';
		sidebarOptions.currentObjectId = 99;
		pageTitle.title = 'Gestão de Tabelas';
	});



	let criandoNovaTabela = $state(false);
	let modalConfirmNovoAno = $state(false);
	let anoNovoParaCriar = $state('');
	let modalConfirmNovoAnoLoading = $state(false);

	function fecharConfirmNovoAno() {
		if (criandoNovaTabela) return;
		modalConfirmNovoAno = false;
		modalConfirmNovoAnoLoading = false;
	}

	async function abrirConfirmNovoAno() {
		if (criandoNovaTabela) return;
		anoNovoParaCriar = '';
		modalConfirmNovoAnoLoading = true;
		modalConfirmNovoAno = true;
		try {
			const res = await fetch('/ep/api/vagas/novo-ano', { method: 'GET' });
			if (res.ok) {
				const payload = await res.json();
				const ano = payload?.ano;
				if (ano && typeof ano.ano_inicio === 'number' && typeof ano.ano_fim === 'number') {
					anoNovoParaCriar = `${ano.ano_inicio}/${ano.ano_fim}`;
				}
			}
		} catch (e) {
			console.error('Erro ao obter próximo ano letivo', e);
			toastr.error('Não foi possível obter o próximo ano letivo.', 'ERRO', { timeOut: 5000 });
		} finally {
			modalConfirmNovoAnoLoading = false;
		}
	}

	async function confirmarCriarNovaTabela() {
		if (criandoNovaTabela || !anoNovoParaCriar) return;
		criandoNovaTabela = true;
		try {
			const res = await fetch('/ep/api/vagas/novo-ano', { method: 'POST' });
			if (!res.ok) {
				toastr.error('Ocorreu um erro ao criar a nova tabela.', 'ERRO', { timeOut: 5000 });
				return;
			}
			toastr.success(
				anoNovoParaCriar
					? `Ano letivo ${anoNovoParaCriar} criado com sucesso!`
					: 'Nova tabela criada com sucesso!',
				'SUCESSO',
				{ timeOut: 5000, progressBar: true }
			);
			modalConfirmNovoAno = false;
			await invalidateAll();
		} catch (e) {
			console.error('Erro a criar novo ano letivo', e);
			toastr.error('Erro de comunicação com o servidor.', 'ERRO', { timeOut: 5000 });
		} finally {
			criandoNovaTabela = false;
		}
	}

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
				res = await fetch(`/ep/api/vagas/ano/${modalAno.anoInicio}`, { method: 'DELETE' });
			} else {
				res = await fetch(`/ep/api/vagas/ano/${modalAno.anoInicio}/reset`, { method: 'PUT' });
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

<Breadcrum modulo="Proposta de Vagas" objeto="Gestão de Tabelas">
	<svelte:fragment slot="actions">
		<button
			type="button"
			class="btn botao-breadcrumb-on btn-sm fw-bold btn-search-hover"
			style="min-width: 130px; height: 36px; border-radius: 4px; font-size: 14px; font-weight: 700;"
			disabled={criandoNovaTabela}
			onclick={abrirConfirmNovoAno}
		>
			{#if criandoNovaTabela}
				<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
				A criar...
			{:else}
				<i class="fa fa-plus me-1" aria-hidden="true"></i> Nova tabela
			{/if}
		</button>
	</svelte:fragment>
</Breadcrum>

<div class="container-fluid" style="padding: 24px;">
	<div class="table-wrapper">
		{#if anos.length === 0}
			<div class="text-center text-muted py-5">
				<i class="fa fa-info-circle fa-2x mb-2" aria-hidden="true"></i>
				<p>Não existem anos letivos na base de dados.</p>
			</div>
		{:else}
			<div class="table-scroll">
			<table class="gestao-table">
				<thead>
					<tr>
						<th class="header-main" colspan="6">Gestão de Tabelas (Anos Letivos)</th>
					</tr>
					<tr>
						<th class="header-col">Ano Letivo</th>
						<th class="header-col">N.º Cursos</th>
						<th class="header-col">Total dados inseridos</th>
						<th class="header-col">Dados importados DGES</th>
						<th class="header-col">Estado</th>
						<th class="header-col">Ações</th>
					</tr>
				</thead>
				<tbody>
					{#each anos as ano, idx (ano.anoInicio)}
						<tr class={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
							<td class="td-ano">{ano.label}</td>
							<td>{ano.totalCursos}</td>
							<td class="td-dados">
								{#if ano.totalDadosInseridos > 0}
									<span
										class="badge-dados"
										title="{ano.totalDadosInseridos} valor{ano.totalDadosInseridos === 1 ? '' : 'es'} preenchido{ano.totalDadosInseridos === 1 ? '' : 's'} na tabela"
									>
										{ano.totalDadosInseridos}
									</span>
								{:else}
									<span class="badge-dados-zero">0</span>
								{/if}
							</td>
							<td class="td-dges">
								{#if ano.totalCamposDges > 0}
									<span
										class="badge-dges"
										title="{ano.totalCamposDges} campo{ano.totalCamposDges === 1 ? '' : 's'} importado{ano.totalCamposDges === 1 ? '' : 's'} em {ano.totalCursosDges} curso{ano.totalCursosDges === 1 ? '' : 's'}"
									>
										{ano.totalCamposDges} campo{ano.totalCamposDges === 1 ? '' : 's'}
										<span class="badge-dges-sub">({ano.totalCursosDges} curso{ano.totalCursosDges === 1 ? '' : 's'})</span>
									</span>
								{:else}
									<span class="badge-dges-zero">0</span>
								{/if}
							</td>
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
									<i class="fa fa-eraser me-1" aria-hidden="true"></i> Limpar dados
								</button>
								<button
									type="button"
									class="btn-apagar"
									onclick={() => openModal(ano, 'delete')}
								>
									<i class="fa fa-trash me-1" aria-hidden="true"></i> Apagar ano
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			</div>
		{/if}
	</div>

	<div class="notas">
		<i class="fa fa-info-circle me-1" aria-hidden="true"></i>
		<strong>Limpar dados</strong> — coloca todos os valores numéricos a 0, mas mantém a estrutura (cursos e ano letivo).
		<br/>
		<i class="fa fa-info-circle me-1" aria-hidden="true"></i>
		<strong>Total dados inseridos</strong> — número de valores preenchidos (≠ 0) em estatísticas, matrículas, movimentos e overrides.
		<br/>
		<i class="fa fa-info-circle me-1" aria-hidden="true"></i>
		<strong>Dados importados DGES</strong> — número de campos marcados como importados da DGES (statcol) na tabela de origem.
		<br/>
		<i class="fa fa-exclamation-triangle me-1" style="color: #c0392b;" aria-hidden="true"></i>
		<strong>Apagar ano</strong> — remove completamente o ano letivo e todos os dados associados. Esta operação é irreversível.
	</div>
</div>

{#if modalConfirmNovoAno}
	<div class="modal d-block modal-gestao-confirm modal-confirm-novo-ano" tabindex="-1" role="dialog" aria-modal="true">
		<div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 520px; width: 90%;">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Confirmar criação de nova tabela</h5>
					<button type="button" class="close" aria-label="Fechar" onclick={fecharConfirmNovoAno}>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					Vai ser criado o ano letivo:
					<strong>{modalConfirmNovoAnoLoading ? 'Carregando...' : anoNovoParaCriar || '—'}</strong>
					<p class="small text-muted mb-0" style="margin-top: 10px;">
						A nova tabela será criada com todos os valores a 0.
					</p>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						onclick={fecharConfirmNovoAno}
						disabled={criandoNovaTabela || modalConfirmNovoAnoLoading}
					>
						Cancelar
					</button>
					<button
						type="button"
						class="btn btn-primary btn-nova-tabela-confirm"
						onclick={confirmarCriarNovaTabela}
						disabled={criandoNovaTabela || modalConfirmNovoAnoLoading || !anoNovoParaCriar}
					>
						{#if criandoNovaTabela}
							<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
							Confirmando...
						{:else}
							Confirmar
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

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
							<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
							A processar...
						{:else if modalAction === 'delete'}
							<i class="fa fa-trash me-1" aria-hidden="true"></i> Apagar
						{:else}
							<i class="fa fa-eraser me-1" aria-hidden="true"></i> Limpar dados
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
	.table-scroll {
		overflow-x: auto;
	}
	.gestao-table {
		border-collapse: collapse;
		width: 100%;
		min-width: 760px;
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
	.badge-dados {
		display: inline-block;
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 600;
		border-radius: 10px;
		background-color: #e8f5e9;
		color: #2e7d32;
	}
	.badge-dados-zero {
		color: #9e9e9e;
		font-weight: 500;
	}
	.badge-zerada {
		background-color: #fff3e0;
		color: #e65100;
	}
	.badge-dges {
		display: inline-block;
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 600;
		border-radius: 10px;
		background-color: #e3f2fd;
		color: #1565c0;
		line-height: 1.4;
	}
	.badge-dges-sub {
		font-weight: 500;
		opacity: 0.85;
	}
	.badge-dges-zero {
		color: #9e9e9e;
		font-weight: 500;
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
	.btn-search-hover {
		transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
		background-color: #20a8d8 !important;
		border-color: #20a8d8 !important;
		background-image: none !important;
		color: #fff !important;
		cursor: pointer;
	}
	.btn-search-hover:hover:not(:disabled) {
		background-color: #1a93cc !important;
		border-color: #1a93cc !important;
	}
	.btn-search-hover:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
	.btn-nova-tabela-confirm {
		background-color: #20a8d8;
		border-color: #20a8d8;
	}
	.btn-nova-tabela-confirm:hover:not(:disabled) {
		background-color: #1a8fb8;
		border-color: #1a8fb8;
	}
</style>
