'use client'
export const setItem = (key: string, item: string) => {
	if (typeof window !== 'undefined') localStorage.setItem(key, item)
}

export const getItem = (key: string) => {
	if (typeof window !== 'undefined') return localStorage.getItem(key)
}
