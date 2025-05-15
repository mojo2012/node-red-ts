export class ArrayUtil {
	public static equals(arrOne: Array<unknown>, arrTwo: Array<unknown>): boolean {
		let result = arrOne.length === arrTwo.length;

		if (arrOne.length === arrTwo.length) {
			for (let i = 0; i < arrOne.length; i++) {
				result = arrTwo.indexOf(arrOne[i]) !== -1;

				if (result === false) {
					break;
				}
			}
		}

		return result;
	}
}
