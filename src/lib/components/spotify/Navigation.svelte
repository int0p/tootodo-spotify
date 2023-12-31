<script lang="ts">
	import { Home, Search, ListMusic, Menu, X, type Icon } from 'lucide-svelte';
	import { tick, type ComponentType } from 'svelte';
	import { IconButton } from '$components';
	import logo from '$assets/Spotify_Logo_RGB_White.png';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { beforeNavigate } from '$app/navigation';

	export let desktop: boolean;
	export let userAllPlaylists: SpotifyApi.PlaylistObjectSimplified[] | undefined;

	let isMobileMenuOpen = false;
	$: isOpen = desktop || isMobileMenuOpen;
	let openMenuButton: IconButton;
	let closeMenuButton: IconButton;
	let lastFocusableElement: HTMLAnchorElement;
	const menuItems: { path: string; label: string; icon: ComponentType<Icon> }[] = [
		{
			path: '/spotify',
			label: 'Home',
			icon: Home
		},
		{
			path: '/spotify/search',
			label: 'Search',
			icon: Search
		},
		{
			path: '/spotify/playlists',
			label: 'Playlists',
			icon: ListMusic
		}
	];

	const openMenu = async () => {
		isMobileMenuOpen = true;
		await tick();
		closeMenuButton.getButton().focus();
	};
	const closeMenu = async () => {
		isMobileMenuOpen = false;
		await tick();
		openMenuButton.getButton().focus();
	};
	//focus trap (mobile에서, menu버튼을 눌렀을 때, tap키를 누를 수 있는 범위 제한(only 메뉴바 내부))
	//제일 위(close button)에서 shift tab눌렀을 경우 제일 밑으로 focus이동
	const moveFocusToBottom = (e: KeyboardEvent) => {
		if (desktop) return;
		if (e.key === 'Tab' && e.shiftKey) {
			e.preventDefault();
			lastFocusableElement.focus();
		}
	};
	//마지막 menu아이템에 focus가 있는 상태에서 tap을 누르면, 제일 위에 있는 버튼으로 focus이동
	const moveFocusToTop = (e: KeyboardEvent) => {
		if (desktop) return;
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault();
			closeMenuButton.getButton().focus();
		}
	};
	//esc버튼을 누르면 메뉴가 닫힌다.
	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeMenu();
		}
	};
	//페이지 전환하기 전에 메뉴를 닫는다.
	beforeNavigate(() => {
		isMobileMenuOpen = false;
	});
	//todo: 화면크기에 따라 desktop 값 받도록 코드 수정. (지금은 class뗐다붙였다로 화면에서 보일까말까 구현
</script>

<svelte:head>
	{#if !desktop && isMobileMenuOpen}
		<style>
			body {
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<div class="nav-content w-full h-full" class:desktop class:mobile={!desktop}>
	<!--    모바일에서 menu를 열면, 뒷 버튼 눌리지 않게 overlay-->
	{#if !desktop && isMobileMenuOpen}
		<div
			class="overlay"
			on:click={closeMenu}
			transition:fade={{ duration: 200 }}
			on:keyup={handleEscape}
		/>
		<!--        todo on:keyup={handleEscape} 왜 필요함? 얘 없어도 esc잘됨.-->
	{/if}
	<!--    모바일일 때 menu를 열면, 좌측에서부터 메뉴가 스윽 등장. 데스크탑일땐 menu가 디폴트로 존재. -->
	<nav aria-label="Main" class="h-full w-full">
		{#if !desktop}
			<IconButton
				icon={Menu}
				label="Open menu"
				on:click={openMenu}
				bind:this={openMenuButton}
				class="menu-button !bg-black/0"
				aria-expanded={isOpen}
			/>
		{/if}
		<div
			class="nav-content-inner h-full w-full"
			class:is-hidden={!isOpen}
			style:visibility={isOpen ? 'visible' : 'hidden'}
			on:keyup={handleEscape}
		>
			{#if !desktop}
				<IconButton
					icon={X}
					label="Close Menu"
					bind:this={closeMenuButton}
					on:click={closeMenu}
					on:keydown={moveFocusToBottom}
					class="close-menu-button"
				/>
			{/if}
			<div class="logo-and-menu">
				<img src={logo} class="logo" alt="Spotify" />
				<ul>
					{#each menuItems as item, index}
						{@const iconProps = {
							focusable: 'false',
							'aria-hidden': true,
							color: 'var(--text-color)',
							size: 26,
							strokeWidth: 2
						}}
						<li class:active={item.path === $page.url.pathname}>
							{#if menuItems.length === index + 1}
								<a bind:this={lastFocusableElement} href={item.path} on:keydown={moveFocusToTop}>
									<svelte:component this={item.icon} {...iconProps} />
									{item.label}
								</a>
							{:else}
								<a href={item.path}>
									<svelte:component this={item.icon} {...iconProps} />
									{item.label}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			{#if userAllPlaylists && userAllPlaylists.length > 0}
				<div class="all-playlists hide-scrollbar">
					<ul>
						{#each userAllPlaylists as playlist}
							<li class:active={$page.url.pathname === `/spotify/playlist/${playlist.id}`}>
								<a href="/spotify/playlist/{playlist.id}">{playlist.name}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</nav>
</div>

<style lang="scss">
	.nav-content {
		.overlay {
			position: fixed;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: var(--sidebar-color);
			opacity: 0.75;
			z-index: 100;
			@include breakpoint.up('md') {
				display: none;
			}
		}
		.logo {
			max-width: 100%;
			width: 130px;
		}
		.nav-content-inner {
			// padding: 20px;
			min-width: var(--sidebar-width);
			background-color: var(--sidebar-color);
			height: 100%;
			// overflow: auto;
			display: none;
			.logo-and-menu {
				padding: 20px 20px 0;
				overflow: hidden;
			}
			.all-playlists {
				flex: 1;
				overflow: auto;
				padding: 15px 20px;
				border-top: 1px solid var(--border);
				:global(html.no-js) & {
					@include breakpoint.down('md') {
						display: none;
					}
				}
				ul {
					list-style: none;
					margin: 0;
					li {
						margin: 0 0 5px;
						a {
							margin: 0;
						}
					}
				}
			}
			@include breakpoint.down('md') {
				height: 100%;
			}
			ul {
				padding: 0;
				margin: 20px 0 0;
				list-style: none;
				li {
					&.active {
						a {
							opacity: 1;
						}
					}
					a {
						display: flex;
						align-items: center;
						text-decoration: none;
						color: var(--text-color);
						font-size: functions.toRem(14);
						font-weight: 500;
						padding: 5px;
						margin: 10px 0;
						opacity: 0.7;
						transition: opacity 0.2s;
						&:hover,
						&:focus {
							opacity: 1;
						}
						:global(svg) {
							margin-right: 12px;
						}
					}
				}
			}
		}
		&.desktop {
			position: sticky;
			top: 0;
			.nav-content-inner {
				@include breakpoint.up('md') {
					display: flex;
					flex-direction: column;
				}
			}
		}
		&.mobile .nav-content-inner {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 100;
			transition: transform 200ms, opacity 200ms;
			&.is-hidden {
				transition: transform 200ms, opacity 200ms, visibility 200ms;
				transform: translateX(-100%);
				opacity: 0;
			}
			@include breakpoint.down('md') {
				display: flex;
				flex-direction: column;
			}
		}
		:global(.menu-button) {
			@include breakpoint.up('md') {
				display: none;
			}
		}
		:global(.close-menu-button) {
			position: absolute;
			right: 20px;
			top: 20px;
		}
	}
</style>
