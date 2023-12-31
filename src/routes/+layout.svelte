<!-- theme, tab bar-->
<script lang="ts">
	// theme
	import '../theme.postcss';
	import '$styles/spotify.scss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';

	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	// page info
	// $:console.log($page.data.title);
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { HeaderNav, Pomodoro } from '$components';

	NProgress.configure({ showSpinner: false });
	afterNavigate(() => {
		NProgress.done();
	});
	beforeNavigate(() => {
		NProgress.start();
		console.log();
	});

	// get current time and day
	import { onDestroy, onMount } from 'svelte';
	import { selectedDate } from '$stores/useLocStorage.js';
	import moment from 'moment';
	let currentTime;
	onMount(() => {
		currentTime = setInterval(() => {
			currentTime = moment().format('hh:mm A');
		}, 1000);
		$selectedDate = moment().format('YYYY-MM-DD');
	});
	onDestroy(() => {
		clearInterval(currentTime);
	});

	// tippy
	import { tippy } from '$actions';
	// navigation ui
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
	//icon
	import { Play, SkipBack, SkipForward, Music4, Sticker, Repeat1, Cog } from 'lucide-svelte';
	import { SettingForm } from '$components';

	let onSpotify = false; //스포티파이 페이지에서 스포티파이 border 두껍게하려고 만듦.
	$: {
		if ($page.url.pathname.includes('/spotify')) {
			onSpotify = true;
		} else {
			onSpotify = false;
		}
	}
</script>

<svelte:head>
	<title>Tootodo {$page.data.title ? ` - ${$page.data.title}` : ''}</title>
</svelte:head>

<div
	class="flex-col h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] justify-center items-center m-auto my-4"
>
	<div class="flex justify-center items-center w-full h-[30px] relative lg:top-3 lg:text-lg">
		<!--		control-->
		<div class="flex w-full h-full absolute">
			<!--			left-->
			<div class=" flex space-x-1">
				<HeaderNav />
				<!--			current time-->
				<div class=" font-digital text-primary-500 font-bold text-xl pl-2 relative top-0.5">
					{currentTime}
				</div>
			</div>

			<!--			right-->
			<div class="flex absolute right-0 top-0.5 space-x-2">
				<!--		pomodoro -->
				<div class="relative -top-1 left-2 scale-90 z-50">
					<Pomodoro />
				</div>
				<!--		overall setting (darkmode, day start time)-->
				<div
					class="chip bg-black/10 dark:bg-white/10 relative -top-2 px-2 py-1.5"
					use:tippy={{
						content: document.getElementById('settingForm') || undefined,
						onMount: () => {
							const template = document.getElementById('settingForm');
							if (template) {
								template.style.display = 'block';
							}
						},
						trigger: 'click, mouseenter',
						placement: 'bottom',
						interactive: true,
						theme: 'setting',
						appendTo: document.body,
						hideOnPopperBlur: false,
						allowHTML: true
					}}
				>
					<Cog size={23} />
				</div>

				<div id="settingForm" class="hidden">
					<SettingForm />
				</div>
			</div>
		</div>

		<!--		tab-->
		<div
			data-sveltekit-reload
			class="flex justify-between w-[calc(100%-400px)] max-w-[70%] space-x-2 relative -top-1.5 -left-3.5"
		>
			<TabGroup justify="justify-start" class="w-[220px] lg:relative lg:-top-1">
				<TabAnchor on:click={() => goto('/too')} selected={$page.url.pathname.includes('/too')}
					><span class="relative top-1 left-3">Too</span>
				</TabAnchor>

				<TabAnchor
					selected={$page.url.pathname.includes('/too') ||
						$page.url.pathname.includes('/do') ||
						$page.url.pathname === '/'}
				>
					<div class="crumb-separator relative top-1" aria-hidden>&rsaquo;</div>
				</TabAnchor>

				<TabAnchor
					on:click={() => goto('/do')}
					selected={$page.url.pathname.includes('/do') || $page.url.pathname === '/'}
					><span class="relative top-1 right-3">Do</span>
				</TabAnchor>

				<TabAnchor on:click={() => goto('/blog')} selected={$page.url.pathname.includes('/blog')}>
					<Sticker size="23" class="relative top-1 lg:relative lg:top-2" strokeWidth={1.5} />
				</TabAnchor>
			</TabGroup>

			<TabGroup justify="justify-start" class="w-full relative top-0.5">
				<TabAnchor
					on:click={() => goto('/spotify')}
					selected={$page.url.pathname.includes('/spotify')}
					class="relative w-full h-full"
				>
					<Music4 size="23" class="relative top-1 -left-2" strokeWidth={1.5} />
					<div class="chip absolute top-1 left-5 w-[calc(100%-130px)] h-full px-2 text-[1rem]">
						재생중인 노래가 없습니다.
					</div>
					<div
						class="chip variant-glass-primary py-1 px-2 absolute bottom-1 right-24
    									dark:bg-primary-500/50 dark:text-white z-10"
					>
<!--						<span><Repeat1 size={16} /></span>-->
					</div>
				</TabAnchor>

				<!--				music controller-->
				<div
					class="absolute flex -right-1 top-[0.55rem] z-10 rounded-lg text-black
				divide-x divide-black dark:text-white dark:divide-white
				border border-surface-400-500-token
				 "
					class:onSpotify
				>
					<button class="btn py-1.5 px-2 rounded-none">
						<span><SkipBack size={14} class="dark:fill-white/70 " /></span>
					</button>
					<button class="btn py-1.5 px-2 rounded-none">
						<span><Play size={16} class="dark:fill-white/70 fill-surface-900" /></span>
					</button>
					<button class="btn py-1.5 px-2 rounded-none">
						<span><SkipForward size={14} class="dark:fill-white/70" /></span>
					</button>
				</div>
			</TabGroup>
		</div>
	</div>
	<div
		class="w-full h-[calc(100%-40px)] m-auto my-1 relative top-1.5 lg:h-[calc(100%-50px)] lg:top-4"
	>
		<slot />
	</div>
</div>

<style>
	.onSpotify {
		@apply border-2 border-surface-900 dark:border-white;
	}
</style>
