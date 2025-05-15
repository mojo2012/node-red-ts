export class NumberUtil {
	private constructor() {}

	public static parseNumberValue = (value?: string, options = { comma: ',', separator: '.' }): number | undefined => {
		const trimmedValue = value //
			?.replace('€', '')
			?.replace('%', '')
			?.replaceAll(options.separator, '')
			?.replaceAll(options.comma, '.')
			?.replaceAll('-', '')
			?.trim();

		return trimmedValue ? Number(trimmedValue) : undefined;
	}
}
