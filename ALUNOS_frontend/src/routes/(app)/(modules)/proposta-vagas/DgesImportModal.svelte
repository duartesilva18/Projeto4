<script>
	import { browser } from '$app/environment';

	/** @type {{
	 *   open?: boolean;
	 *   anosDisponiveis?: string[];
	 *   defaultAno?: string;
	 *   onApplied?: () => void | Promise<void>;
	 * }} */
	let { open = $bindable(false), anosDisponiveis = [], defaultAno = '', onApplied } = $props();

	let importFiles = $state(/** @type {File[]} */ ([]));
	let importAno = $state('');
	let importOverwrite = $state(false);
	let importPreview = $state(/** @type {Record<string, unknown> | null} */ (null));
	let importPreviewLoading = $state(false);
	let importApplyLoading = $state(false);
	let importTipos = $state(/** @type {{ id: string; label: string }[]} */ ([]));
	let importFormatos = $state(
		/** @type {{ suportados?: any[]; naoSuportados?: string[]; nota?: string } | null} */ (null)
	);
	let importTipoOverrides = $state(/** @type {Record<string, string>} */ ({}));
	let importHelpOpen = $state(true);
	let importHistoricoOpen = $state(false);
	let importHistoricoLoading = $state(false);
	let importHistorico = $state(/** @type {any[]} */ ([]));
	let importLastApplySummary = $state(/** @type {string | null} */ (null));
	let importDragOver = $state(false);
	let importWasOpen = $state(false);

	$effect(() => {
		if (open && !importWasOpen) {
			resetOnOpen();
		}
		importWasOpen = open;
	});

	/** @returns {Promise<typeof import('toastr').default | null>} */
	async function getToastr() {
		if (!browser) return null;
		const mod = await import('toastr');
		return mod.default;
	}

	/** @param {string} msg @param {string} [title] */
	async function toastSuccess(msg, title = 'SUCESSO') {
		const t = await getToastr();
		t?.success(msg, title, { timeOut: 5000, progressBar: true });
	}

	/** @param {string} msg @param {string} [title] */
	async function toastError(msg, title = 'ERRO') {
		const t = await getToastr();
		t?.error(msg, title, { timeOut: 8000, progressBar: true });
	}

	let importApplyFieldCount = $derived.by(() => {
		const preview = /** @type {any} */ (importPreview);
		return Number(preview?.summary?.fieldCount ?? 0);
	});

	/** @param {any} filePreview */
	function importEffectiveTipo(filePreview) {
		return (
			importTipoOverrides[filePreview.fileName] ??
			filePreview.tipoOverride ??
			filePreview.detection?.tipo ??
			''
		);
	}

	/** @param {any} filePreview */
	function importFileHasTipoOverride(filePreview) {
		const name = filePreview.fileName;
		return Boolean(importTipoOverrides[name] || filePreview.tipoOverride);
	}

	/** @param {any} preview */
	function importPreviewBlockingReason(preview) {
		if (!preview?.files?.length) return '';
		for (const file of preview.files) {
			if (file.detection?.unsupportedReason) {
				return `«${file.fileName}» não é suportado — remova-o ou escolha outro PDF.`;
			}
			const tipo = importEffectiveTipo(file);
			if ((!tipo || tipo === 'desconhecido') && !importFileHasTipoOverride(file)) {
				return `Confirme o tipo de documento de «${file.fileName}» e pré-visualize novamente.`;
			}
			if (file.detection?.confianca === 'baixa' && !importFileHasTipoOverride(file)) {
				return `Confiança baixa em «${file.fileName}» — confirme o tipo manualmente.`;
			}
			if (file.detection?.phaseAmbiguous && !importFileHasTipoOverride(file)) {
				return `Fase ambígua em «${file.fileName}» — confirme o tipo de documento manualmente.`;
			}
		}
		const conflicts = Number(preview.summary?.conflictCount ?? 0);
		if (conflicts > 0) {
			return `${conflicts} conflito(s) entre ficheiros — remova PDFs duplicados ou gere a pré-visualização com um ficheiro por campo.`;
		}
		return '';
	}

	let importCanApply = $derived.by(() => {
		const preview = /** @type {any} */ (importPreview);
		if (!preview?.previewId || importApplyFieldCount <= 0 || importApplyLoading) return false;
		return !importPreviewBlockingReason(preview);
	});

	let importApplyDisabledReason = $derived.by(() => {
		if (importApplyLoading) return 'A aplicar importação…';
		if (!importPreview) return 'Clique «Pré-visualizar» para analisar os PDFs.';
		const preview = /** @type {any} */ (importPreview);
		if (!preview?.previewId) return 'Pré-visualização inválida. Tente «Pré-visualizar» novamente.';
		if (importApplyFieldCount <= 0) {
			return 'Não há campos a importar. Use PDFs com dados IPVC e confirme o ano letivo.';
		}
		const blockReason = importPreviewBlockingReason(preview);
		if (blockReason) return blockReason;
		return '';
	});

	const IMPORT_FIELD_LABELS = {
		vagas1F: 'Vagas 1.ª fase',
		candidatos1F: 'Candidatos 1.ª fase',
		colocados1F: 'Colocados 1.ª fase',
		vagas2F: 'Vagas 2.ª fase',
		candidatos2F: 'Candidatos 2.ª fase',
		colocados2F: 'Colocados 2.ª fase',
		vagas3F: 'Vagas 3.ª fase',
		candidatos3F: 'Candidatos 3.ª fase',
		colocados3F: 'Colocados 3.ª fase',
		classificacaoUltimo1F: 'Classificação último colocado 1.ª fase',
		classificacaoUltimo2F: 'Classificação último colocado 2.ª fase',
		classificacaoUltimo3F: 'Classificação último colocado 3.ª fase'
	};

	/** @param {string} key */
	function importFieldLabel(key) {
		return IMPORT_FIELD_LABELS[/** @type {keyof typeof IMPORT_FIELD_LABELS} */ (key)] ?? key;
	}

	/** @param {string | undefined} c */
	function importConfiancaLabel(c) {
		if (c === 'alta') return 'Alta';
		if (c === 'media') return 'Média';
		if (c === 'baixa') return 'Baixa';
		return c ?? '—';
	}

	/** @param {any} filePreview */
	function importFileFieldCount(filePreview) {
		return (filePreview.matched ?? []).reduce(
			/** @param {number} n @param {any} m */
			(n, m) => n + (m.fields ?? []).filter((/** @type {any} */ f) => !f.skipped).length,
			0
		);
	}

	/** @param {any} filePreview */
	function importFileStatus(filePreview) {
		if (filePreview.detection?.unsupportedReason) return 'error';
		if (importFileFieldCount(filePreview) > 0) return 'ok';
		return 'warn';
	}

	/** @param {string} iso */
	function formatHistoricoDate(iso) {
		try {
			return new Date(iso).toLocaleString('pt-PT');
		} catch {
			return iso;
		}
	}

	function resetOnOpen() {
		importPreview = null;
		importFiles = [];
		importTipoOverrides = {};
		importHelpOpen = true;
		importHistoricoOpen = false;
		importHistorico = [];
		importLastApplySummary = null;
		importOverwrite = false;
		importAno = defaultAno || anosDisponiveis[0] || '';
		carregarImportTipos();
	}

	function fecharImportDges() {
		if (importPreviewLoading || importApplyLoading) return;
		open = false;
		importPreview = null;
	}

	function onImportAnoChange(/** @type {Event} */ e) {
		importAno = /** @type {HTMLSelectElement} */ (e.currentTarget).value;
		importPreview = null;
		importHistorico = [];
		if (importHistoricoOpen) carregarHistorico();
	}

	function onImportOverwriteChange(/** @type {Event} */ e) {
		importOverwrite = /** @type {HTMLInputElement} */ (e.currentTarget).checked;
		importPreview = null;
	}

	async function carregarImportTipos() {
		if (importTipos.length && importFormatos) return;
		try {
			const [tiposRes, formatosRes] = await Promise.all([
				fetch('/ep/api/vagas/import/dges/tipos'),
				fetch('/ep/api/vagas/import/dges/formatos')
			]);
			if (tiposRes.ok) importTipos = await tiposRes.json();
			if (formatosRes.ok) importFormatos = await formatosRes.json();
		} catch {
			importTipos = [];
			importFormatos = null;
		}
	}

	/** @param {FileList | File[]} files */
	function setImportFiles(files) {
		importFiles = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
		importPreview = null;
		importTipoOverrides = {};
	}

	/** @param {Event} e */
	function onImportFilesSelected(e) {
		const input = /** @type {HTMLInputElement} */ (e.currentTarget);
		setImportFiles(input.files ?? []);
	}

	/** @param {DragEvent} e */
	function onImportDrop(e) {
		e.preventDefault();
		importDragOver = false;
		if (e.dataTransfer?.files?.length) setImportFiles(e.dataTransfer.files);
	}

	/** @param {string} fileName @param {string} tipo */
	function setImportTipoOverride(fileName, tipo) {
		importTipoOverrides = { ...importTipoOverrides, [fileName]: tipo };
		importPreview = null;
	}

	async function carregarHistorico() {
		const anoInicio = parseInt(String(importAno).split('/')[0] || '', 10);
		if (!Number.isFinite(anoInicio)) return;
		importHistoricoLoading = true;
		try {
			const res = await fetch(`/ep/api/vagas/import/dges/historico?ano=${anoInicio}`);
			importHistorico = res.ok ? await res.json() : [];
		} catch {
			importHistorico = [];
		} finally {
			importHistoricoLoading = false;
		}
	}

	async function toggleHistorico() {
		importHistoricoOpen = !importHistoricoOpen;
		if (importHistoricoOpen && !importHistorico.length) {
			await carregarHistorico();
		}
	}

	async function previewImportDges() {
		if (!importFiles.length) {
			toastError('Selecione pelo menos um ficheiro PDF.');
			return;
		}
		const anoInicio = parseInt(String(importAno).split('/')[0] || '', 10);
		if (!Number.isFinite(anoInicio)) {
			toastError('Ano letivo inválido.');
			return;
		}
		importPreviewLoading = true;
		importLastApplySummary = null;
		try {
			const fd = new FormData();
			for (const f of importFiles) fd.append('files', f);
			fd.append('anoInicio', String(anoInicio));
			fd.append('overwrite', importOverwrite ? '1' : '0');
			if (Object.keys(importTipoOverrides).length) {
				fd.append('tipoOverrides', JSON.stringify(importTipoOverrides));
			}
			const res = await fetch('/ep/api/vagas/import/dges/preview', { method: 'POST', body: fd });
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || 'Erro na pré-visualização');
			}
			importPreview = data;
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Erro ao analisar PDFs';
			toastError(msg);
		} finally {
			importPreviewLoading = false;
		}
	}

	async function aplicarImportDges() {
		const previewId = importPreview?.previewId;
		if (!previewId || typeof previewId !== 'string') return;
		importApplyLoading = true;
		try {
			const res = await fetch('/ep/api/vagas/import/dges/apply', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ previewId })
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || 'Erro ao aplicar importação');
			}
			const ficheiros = Array.isArray(data.ficheiros) ? data.ficheiros.length : 0;
			importLastApplySummary = `${data.updatedFields ?? 0} campos em ${data.updatedCourses ?? 0} cursos · ${ficheiros} ficheiro(s)`;
			toastSuccess(`Importação concluída: ${importLastApplySummary}.`);
			importPreview = null;
			if (onApplied) await onApplied();
			open = false;
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Erro ao aplicar importação';
			toastError(msg);
		} finally {
			importApplyLoading = false;
		}
	}
</script>

{#if open}
	<div class="modal modal-editar-vagas modal-import-dges d-block" tabindex="-1" role="dialog" aria-modal="true">
		<div class="modal-dialog modal-dialog-centered modal-lg" role="document" style="max-width: 900px; width: 95%;">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Importar ficheiros DGES (statcol)</h5>
					<button type="button" class="close" aria-label="Fechar" onclick={fecharImportDges}>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="import-help">
						<button
							type="button"
							class="import-help-toggle"
							onclick={() => (importHelpOpen = !importHelpOpen)}
							aria-expanded={importHelpOpen}
							aria-controls="import-help-body"
						>
							<span>Que PDFs devo usar na página statcol da DGES?</span>
							<span aria-hidden="true">{importHelpOpen ? '▾' : '▸'}</span>
						</button>
						{#if importHelpOpen}
							<div class="import-help-body" id="import-help-body">
								{#if importFormatos?.suportados?.length}
									<p class="mb-2 small text-muted">
										PDFs da statcol DGES — pode carregar vários na mesma importação.
									</p>
									<ul class="import-format-list mb-2">
										{#each importFormatos.suportados as fmt}
											<li class="import-ok">
												<strong>{fmt.label}</strong>
												{#if fmt.importa?.length}
													<span class="text-success"> — {fmt.importa.join(', ')}</span>
												{/if}
												{#if fmt.naoImporta?.length}
													<span class="text-muted"> ({fmt.naoImporta[0]})</span>
												{/if}
											</li>
										{/each}
									</ul>
									{#if importFormatos.naoSuportados?.length}
										<p class="small import-no mb-0">
											Não usar: Resumo, Comparação entre anos, PDFs sem secção IPVC.
										</p>
									{/if}
								{:else}
									<p class="mb-1">A carregar…</p>
								{/if}
							</div>
						{/if}
					</div>

					<p class="mb-2">
						<button type="button" class="btn btn-link btn-sm p-0 import-historico-link" onclick={toggleHistorico}>
							{importHistoricoOpen ? 'Ocultar' : 'Ver'} últimas importações
						</button>
					</p>
					{#if importHistoricoOpen}
						<div class="import-historico mb-3">
							{#if importHistoricoLoading}
								<p class="small text-muted mb-0">A carregar histórico…</p>
							{:else if !importHistorico.length}
								<p class="small text-muted mb-0">Sem importações registadas para este ano.</p>
							{:else}
								<ul class="import-historico-list mb-0">
									{#each importHistorico as entry}
										<li>
											<strong>{formatHistoricoDate(entry.createdAt)}</strong>
											{#if entry.userId}
												· {entry.userId}
											{/if}
											— {entry.updatedFields} campos, {entry.updatedCourses} cursos
											{#if entry.ficheiros?.length}
												<br /><span class="text-muted">{entry.ficheiros.join(', ')}</span>
											{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}

					<div class="row g-3 mb-2 import-form-row">
						<div class="col-md-4">
							<label class="form-label" for="import-ano">Ano letivo</label>
							<select
								id="import-ano"
								class="form-control form-control-sm"
								value={importAno}
								onchange={onImportAnoChange}
							>
								{#each anosDisponiveis as ano}
									<option value={ano}>{ano}</option>
								{/each}
							</select>
						</div>
						<div class="col-md-8">
							<span class="form-label d-block">Ficheiros PDF</span>
							<div
								class="import-file-zone"
								class:import-file-zone--drag={importDragOver}
								role="group"
								aria-label="Zona de carregamento de ficheiros PDF"
								ondragover={(e) => {
									e.preventDefault();
									importDragOver = true;
								}}
								ondragleave={() => (importDragOver = false)}
								ondrop={onImportDrop}
							>
								<input
									id="import-files"
									type="file"
									class="import-file-input"
									accept=".pdf,application/pdf"
									multiple
									onchange={onImportFilesSelected}
								/>
								<label for="import-files" class="import-file-label">
									<span class="import-file-icon" aria-hidden="true">
										<i class="fa fa-cloud-upload"></i>
									</span>
									<span class="import-file-text">
										{#if importFiles.length > 0}
											{importFiles.length} ficheiro(s) selecionado(s)
										{:else}
											Clique ou arraste PDFs para aqui
										{/if}
									</span>
									<span class="import-file-hint">Statcol DGES · múltiplos ficheiros</span>
								</label>
								{#if importFiles.length > 0}
									<ul class="import-file-list">
										{#each importFiles as f}
											<li title={f.name}>{f.name}</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					</div>
					<div class="import-actions-top">
						<div class="form-check mb-0">
							<input
								id="import-overwrite"
								class="form-check-input"
								type="checkbox"
								checked={importOverwrite}
								onchange={onImportOverwriteChange}
							/>
							<label class="form-check-label" for="import-overwrite">
								Sobrescrever valores já preenchidos manualmente
							</label>
						</div>
						<button
							type="button"
							class="btn btn-outline-primary btn-sm import-preview-btn"
							disabled={importPreviewLoading || !importFiles.length}
							onclick={previewImportDges}
						>
							{#if importPreviewLoading}
								<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
								A analisar…
							{:else}
								Pré-visualizar
							{/if}
						</button>
					</div>

					{#if importPreview}
						{@const preview = /** @type {any} */ (importPreview)}
						{@const fieldCount = preview.summary?.fieldCount ?? 0}
						{@const conflictCount = preview.summary?.conflictCount ?? 0}
						<div class="alert alert-light border import-summary mb-3">
							<div class="import-stat">
								<span class="import-stat-value">{preview.summary?.fileCount ?? 0}</span>
								<span class="import-stat-label">Ficheiro(s)</span>
							</div>
							<div class="import-stat" class:import-stat--ok={fieldCount > 0}>
								<span class="import-stat-value">{preview.summary?.courseCount ?? 0}</span>
								<span class="import-stat-label">Curso(s)</span>
							</div>
							<div
								class="import-stat"
								class:import-stat--ok={fieldCount > 0}
								class:import-stat--warn={fieldCount === 0}
							>
								<span class="import-stat-value">{fieldCount}</span>
								<span class="import-stat-label">Campo(s) a importar</span>
							</div>
							<div
								class="import-stat"
								class:import-stat--danger={(preview.summary?.unmatchedCount ?? 0) > 0}
							>
								<span class="import-stat-value">{preview.summary?.unmatchedCount ?? 0}</span>
								<span class="import-stat-label">Não encontrado(s)</span>
							</div>
							<div
								class="import-stat"
								class:import-stat--warn={conflictCount > 0}
								class:import-stat--danger={conflictCount > 0}
							>
								<span class="import-stat-value">{conflictCount}</span>
								<span class="import-stat-label">Conflito(s)</span>
							</div>
							{#if conflictCount > 0}
								<p class="import-summary-empty mb-0">
									Vários PDFs alteram o mesmo campo — prevalece o último ficheiro carregado.
								</p>
							{:else if fieldCount === 0}
								<p class="import-summary-empty mb-0">
									Nenhum valor pronto a importar. Verifique PDFs e ano letivo.
								</p>
							{/if}
						</div>

						{#if preview.businessWarnings?.length}
							<div class="import-business-warnings mb-3">
								<p class="small fw-bold mb-1">Avisos (não bloqueiam a importação):</p>
								{#each preview.businessWarnings as w}
									<div class="import-alert import-alert--warn">
										<span aria-hidden="true">!</span>
										<span>{w}</span>
									</div>
								{/each}
							</div>
						{/if}

						{#each preview.files ?? [] as filePreview}
							{@const status = importFileStatus(filePreview)}
							{@const fieldsToApply = importFileFieldCount(filePreview)}
							{@const effectiveTipo =
								importTipoOverrides[filePreview.fileName] ??
								filePreview.tipoOverride ??
								filePreview.detection?.tipo ??
								''}
							<div
								class="mb-3 import-file-card import-file-card--{status === 'ok'
									? 'ok'
									: status === 'error'
										? 'error'
										: 'warn'}"
							>
								<div class="import-file-head">
									<p class="import-file-title">{filePreview.fileName}</p>
									<span class="import-status-badge import-status-badge--{status}">
										{#if status === 'ok'}
											{fieldsToApply} campo(s) prontos
										{:else if status === 'error'}
											Não suportado
										{:else}
											Sem dados IPVC
										{/if}
									</span>
								</div>
								<div class="import-meta">
									{#if filePreview.detection?.formatLabel}
										<span class="import-format-badge">{filePreview.detection.formatLabel}</span>
									{/if}
									<span>
										<span class="import-meta-label">Fase/tipo:</span>
										{filePreview.detection?.label ?? '—'}
										({importConfiancaLabel(filePreview.detection?.confianca)})
									</span>
									{#if importTipos.length}
										<label class="mb-0 d-flex align-items-center gap-1 flex-wrap">
											<span class="import-meta-label">Tipo:</span>
											<select
												class="form-control form-control-sm import-tipo-select"
												value={effectiveTipo}
												onchange={(e) =>
													setImportTipoOverride(
														filePreview.fileName,
														/** @type {HTMLSelectElement} */ (e.currentTarget).value
													)}
											>
												<option value="">— Confirmar tipo —</option>
												{#each importTipos as tipo}
													<option value={tipo.id}>{tipo.label}</option>
												{/each}
											</select>
										</label>
									{/if}
								</div>
								{#if filePreview.detection?.unsupportedReason}
									<div class="import-alert import-alert--error">
										<span aria-hidden="true">✕</span>
										<span>{filePreview.detection.unsupportedReason}</span>
									</div>
								{/if}
								{#if filePreview.detection?.phaseAmbiguous && !importFileHasTipoOverride(filePreview)}
									<div class="import-alert import-alert--warn">
										<span aria-hidden="true">!</span>
										<span>Fase ambígua — confirme o tipo e pré-visualize.</span>
									</div>
								{/if}
								{#if filePreview.parseWarnings?.length}
									{#each filePreview.parseWarnings as w}
										{#if w !== filePreview.detection?.unsupportedReason}
											<div class="import-alert import-alert--warn">
												<span aria-hidden="true">!</span>
												<span>{w}</span>
											</div>
										{/if}
									{/each}
								{/if}
								{#if importTipoOverrides[filePreview.fileName] && !importPreviewLoading}
									<p class="small text-primary mb-2">Tipo alterado — clique «Pré-visualizar».</p>
								{/if}
								{#if filePreview.matched?.length}
									<div class="table-responsive" style="max-height: 240px; overflow: auto;">
										<table class="table table-sm table-bordered mb-0 import-table">
											<thead>
												<tr>
													<th>Curso</th>
													<th>Campo</th>
													<th>Atual</th>
													<th>Novo</th>
												</tr>
											</thead>
											<tbody>
												{#each filePreview.matched as match}
													{#each match.fields as field}
														<tr class:is-skipped={field.skipped}>
															<td>{match.courseName} ({match.courseCode})</td>
															<td>{importFieldLabel(field.fieldKey)}</td>
															<td>{field.currentValue}</td>
															<td class="import-val-new">
																{field.newValue}
																{#if field.skipped}
																	<small class="text-muted d-block">{field.skipReason}</small>
																{/if}
															</td>
														</tr>
													{/each}
												{/each}
											</tbody>
										</table>
									</div>
								{:else if !filePreview.detection?.unsupportedReason}
									<div class="import-empty-preview">Nenhuma linha IPVC neste PDF.</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
				<div class="modal-footer">
					{#if importApplyDisabledReason}
						<p
							class="import-footer-hint mb-0"
							class:import-footer-hint--warn={!importCanApply && !!importPreview}
						>
							{importApplyDisabledReason}
						</p>
					{/if}
					<div class="import-footer-actions">
						<button
							type="button"
							class="btn btn-secondary"
							onclick={fecharImportDges}
							disabled={importPreviewLoading || importApplyLoading}
						>
							Cancelar
						</button>
						<button
							type="button"
							class="btn btn-primary btn-search-hover"
							disabled={!importCanApply}
							title={importApplyDisabledReason || 'Aplicar valores da pré-visualização'}
							onclick={aplicarImportDges}
						>
							{#if importApplyLoading}
								<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
								A aplicar…
							{:else}
								Aplicar importação
								{#if importApplyFieldCount > 0}
									<span class="import-apply-count">({importApplyFieldCount})</span>
								{/if}
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-import-dges .modal-dialog {
		max-height: calc(100vh - 2rem);
		margin: 1rem auto;
		display: flex;
		flex-direction: column;
	}
	.modal-import-dges .modal-content {
		max-height: calc(100vh - 2rem);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.modal-import-dges .modal-body {
		overflow-y: auto;
		flex: 1 1 auto;
		min-height: 0;
	}
	.modal-import-dges .modal-footer {
		flex-shrink: 0;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		z-index: 2;
		box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.06);
	}
	.modal-import-dges .import-footer-hint {
		flex: 1 1 12rem;
		margin: 0;
		font-size: 0.8rem;
		color: #6c757d;
		line-height: 1.4;
		min-width: 0;
	}
	.modal-import-dges .import-footer-hint--warn {
		color: #856404;
	}
	.modal-import-dges .import-footer-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
		margin-left: auto;
	}
	.modal-import-dges .import-form-row {
		align-items: flex-end;
	}
	.modal-import-dges .import-actions-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}
	.modal-import-dges .import-file-zone {
		position: relative;
	}
	.modal-import-dges .import-file-zone--drag .import-file-label {
		border-color: #0b5ed7;
		background: linear-gradient(180deg, #eef5ff 0%, #e7f1ff 100%);
	}
	.modal-import-dges .import-file-input {
		position: absolute;
		width: 0.1px;
		height: 0.1px;
		opacity: 0;
		overflow: hidden;
		z-index: -1;
	}
	.modal-import-dges .import-file-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-height: 5.5rem;
		padding: 1rem 1.25rem;
		margin-bottom: 0;
		border: 2px dashed #c5d4e8;
		border-radius: 12px;
		background: linear-gradient(180deg, #f8fbff 0%, #f3f7fc 100%);
		color: #495057;
		text-align: center;
		cursor: pointer;
		transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
	}
	.modal-import-dges .import-file-label:hover {
		border-color: #0b5ed7;
		background: linear-gradient(180deg, #eef5ff 0%, #e7f1ff 100%);
		box-shadow: 0 0 0 3px rgba(11, 94, 215, 0.1);
	}
	.modal-import-dges .import-historico-link {
		font-size: 0.85rem;
	}
	.modal-import-dges .import-historico {
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 0.75rem;
		background: #f8f9fa;
		max-height: 160px;
		overflow-y: auto;
	}
	.modal-import-dges .import-historico-list {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.8rem;
	}
	.modal-import-dges .import-historico-list li {
		padding: 0.35rem 0;
		border-bottom: 1px solid #e9ecef;
	}
	.modal-import-dges .import-historico-list li:last-child {
		border-bottom: none;
	}
	.modal-import-dges .import-help {
		border: 1px solid #e7f1ff;
		border-radius: 8px;
		margin-bottom: 1rem;
		background: #f8fbff;
	}
	.modal-import-dges .import-help-toggle {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 0.85rem;
		border: none;
		background: transparent;
		font-size: 0.85rem;
		font-weight: 600;
		color: #0b5ed7;
		cursor: pointer;
	}
	.modal-import-dges .import-help-body {
		padding: 0 0.85rem 0.75rem;
		font-size: 0.85rem;
	}
	.modal-import-dges .import-format-list {
		list-style: none;
		padding-left: 0;
	}
	.modal-import-dges .import-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		align-items: flex-start;
	}
	.modal-import-dges .import-stat-value {
		display: block;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.2;
	}
	.modal-import-dges .import-stat-label {
		font-size: 0.72rem;
		color: #6c757d;
		text-transform: uppercase;
	}
	.modal-import-dges .import-stat--ok .import-stat-value {
		color: #198754;
	}
	.modal-import-dges .import-stat--warn .import-stat-value {
		color: #856404;
	}
	.modal-import-dges .import-stat--danger .import-stat-value {
		color: #dc3545;
	}
	.modal-import-dges .import-file-card {
		border: 1px solid #dee2e6;
		border-radius: 10px;
		padding: 0.85rem;
	}
	.modal-import-dges .import-file-card--ok {
		border-left: 4px solid #198754;
	}
	.modal-import-dges .import-file-card--warn {
		border-left: 4px solid #ffc107;
	}
	.modal-import-dges .import-file-card--error {
		border-left: 4px solid #dc3545;
	}
	.modal-import-dges .import-alert {
		display: flex;
		gap: 0.5rem;
		font-size: 0.82rem;
		padding: 0.45rem 0.65rem;
		border-radius: 6px;
		margin-bottom: 0.35rem;
	}
	.modal-import-dges .import-alert--warn {
		background: #fff8e6;
		color: #856404;
	}
	.modal-import-dges .import-alert--error {
		background: #fde8e8;
		color: #842029;
	}
	.modal-import-dges .import-table td.import-val-new {
		font-weight: 600;
		color: #0b5ed7;
	}
	.modal-import-dges .import-table tr.is-skipped {
		opacity: 0.55;
	}
	.modal-import-dges .import-format-list .import-ok {
		margin-bottom: 0.25rem;
	}
	.modal-import-dges .import-no {
		color: #842029;
	}
	.modal-import-dges .import-file-icon {
		font-size: 1.5rem;
		color: #0b5ed7;
	}
	.modal-import-dges .import-file-text {
		font-weight: 600;
		color: #344767;
	}
	.modal-import-dges .import-file-hint {
		font-size: 0.72rem;
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.modal-import-dges .import-file-list {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.modal-import-dges .import-file-list li {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		background: #e7f1ff;
		color: #0b5ed7;
	}
	.modal-import-dges .import-stat {
		min-width: 4.5rem;
	}
	.modal-import-dges .import-summary-empty {
		flex: 1 1 100%;
		font-size: 0.8rem;
		color: #856404;
	}
	.modal-import-dges .import-business-warnings {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.modal-import-dges .import-file-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.modal-import-dges .import-file-title {
		margin: 0;
		font-weight: 600;
		color: #344767;
		word-break: break-all;
	}
	.modal-import-dges .import-status-badge {
		flex-shrink: 0;
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		white-space: nowrap;
	}
	.modal-import-dges .import-status-badge--ok {
		background: #d1e7dd;
		color: #0f5132;
	}
	.modal-import-dges .import-status-badge--warn {
		background: #fff3cd;
		color: #856404;
	}
	.modal-import-dges .import-status-badge--error {
		background: #f8d7da;
		color: #842029;
	}
	.modal-import-dges .import-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.85rem;
		font-size: 0.82rem;
		color: #495057;
		margin-bottom: 0.5rem;
	}
	.modal-import-dges .import-format-badge {
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.15rem 0.5rem;
		border-radius: 6px;
		background: #e7f1ff;
		color: #0b5ed7;
	}
	.modal-import-dges .import-meta-label {
		font-weight: 600;
		color: #6c757d;
	}
	.modal-import-dges .import-tipo-select {
		width: auto;
		min-width: 12rem;
	}
	.modal-import-dges .import-empty-preview {
		font-size: 0.82rem;
		color: #6c757d;
		padding: 0.5rem 0;
	}
	.modal-import-dges .import-apply-count {
		font-weight: 600;
	}
</style>
