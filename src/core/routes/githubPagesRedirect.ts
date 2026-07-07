// GitHub Pages SPA redirect: 404.html が ?p=<route> にリダイレクトするため、
// createBrowserRouter より前にブラウザ URL を本来のパスへ復元する。
// このファイルは main.tsx で App より先に import すること。
const _redirectPath = new URLSearchParams(window.location.search).get('p');
if (_redirectPath) {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	window.history.replaceState(
		null,
		'',
		base + _redirectPath + window.location.hash,
	);
}
