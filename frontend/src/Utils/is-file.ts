export const isFile = (file: unknown): file is File => {
	return (
		!!file &&
		typeof file === 'object' &&
		'type' in file &&
		file.type !== 'application/octet-stream' &&
		'size' in file &&
		'name' in file
	)
}
