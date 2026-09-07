const { createCanvas } = require('canvas')
const { writeFileSync, readdirSync, readFileSync, unlinkSync } = require('fs')
const { numberPadLeft } = require('./utils')
const colors = require('./colors.json')

const WIDTH  = 1000
const HEIGHT = 1000

const canvas = createCanvas(WIDTH, HEIGHT)

// ctx.fillStyle = "#FFFFFF"
// ctx.fillRect(0, 0, WIDTH, HEIGHT)

var files = readdirSync("images")
let num = 0

for(let file of files) {
	if(!file.endsWith(".txt"))
		continue

	let imageFilePng = `output-${numberPadLeft(++num, 4)}.png`
	let content = readFileSync(`images/${file}`)

	let x = 0
	let y = 0
	let width = 500
	let height = 500

	if(content.length > 250_000)
		width = 1000
	if(content.length > 500_000)
		height = 1000

	const ctx = canvas.getContext("2d")

	for(let byte of content) {
		if(byte > 0) {
			// Si pixel posé
			ctx.fillStyle = colors[byte - 1].colorCode
			ctx.fillRect(x, y, 1, 1)
		}

		x++

		if(x >= width) {
			x = 0
			y++
		}
	}

	writeFileSync(`images/${imageFilePng}`, canvas.toBuffer("image/png"))
	console.log(`${imageFilePng} created`)

	unlinkSync(`images/${file}`)
	console.log(`${file} deleted`)
}