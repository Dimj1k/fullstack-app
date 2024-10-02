import {useSyncExternalStore} from 'react'

function onWindowSizeChange(cb: () => void) {
	window.addEventListener('resize', cb, {passive: true})

	return () => window.removeEventListener('resize', cb)
}

export function useChangesWindowSize() {
	const windowHeight = useSyncExternalStore(
		onWindowSizeChange,
		() => window.innerHeight,
		() => null,
	)
	const windowWidth = useSyncExternalStore(
		onWindowSizeChange,
		() => window.innerWidth,
		() => null,
	)
	return {windowHeight, windowWidth}
}
