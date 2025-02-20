<script>
	let { children } = $props();
</script>

<header>
	<nav>
		<a href="/">to home page</a>
		<a href="/subpage">to sub page</a>
		<a href="/middleware">middleware response</a>
	</nav>
</header>

<main>
	{@render children()}
</main>
