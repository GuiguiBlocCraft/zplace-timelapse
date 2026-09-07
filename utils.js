module.exports = {
	/**
	 * Affiche X zéros devant le nombre
	 * @param {number} number
	 */
	numberPadLeft(number, left = 2) {
		return number.toString().padStart(left, '0')
	}
}