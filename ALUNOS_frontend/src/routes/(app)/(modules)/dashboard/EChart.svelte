<script>
	import { onMount } from 'svelte';

	/** @type {{ option: Record<string, unknown>, class?: string }} */
	let { option, class: className = '' } = $props();

	let host = $state(/** @type {HTMLDivElement | null} */ (null));
	let chartReady = $state(false);
	/** @type {import('echarts').ECharts | null} */
	let chart = null;
	let lastOptionJson = '';

	onMount(() => {
		let disposed = false;
		/** @type {(() => void) | undefined} */
		let resizeFn;
		/** @type {ResizeObserver | undefined} */
		let resizeObserver;
		/** @type {number | undefined} */
		let resizeFrame;

		import('echarts').then((echarts) => {
			if (disposed || !host) return;

			chart = echarts.init(host, undefined, { renderer: 'canvas' });
			chart.setOption(option);
			lastOptionJson = JSON.stringify(option);

			resizeFn = () => {
				if (!chart) return;
				if (resizeFrame) cancelAnimationFrame(resizeFrame);
				resizeFrame = requestAnimationFrame(() => chart?.resize());
			};

			window.addEventListener('resize', resizeFn);

			const observeTarget = host.parentElement ?? host;
			resizeObserver = new ResizeObserver(resizeFn);
			resizeObserver.observe(observeTarget);

			chartReady = true;
		});

		return () => {
			disposed = true;
			chartReady = false;
			if (resizeFrame) cancelAnimationFrame(resizeFrame);
			if (resizeFn) window.removeEventListener('resize', resizeFn);
			resizeObserver?.disconnect();
			chart?.dispose();
			chart = null;
			lastOptionJson = '';
		};
	});

	$effect(() => {
		if (!chartReady || !chart || !option) return;

		const json = JSON.stringify(option);
		if (json === lastOptionJson) return;

		lastOptionJson = json;
		chart.setOption(option, { notMerge: true });
	});
</script>

<div class="echart-host {className}" bind:this={host} role="img" aria-hidden="true"></div>

<style>
	.echart-host {
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
