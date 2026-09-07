const { existsSync } = require('fs')
const { writeFile, mkdir } = require('fs/promises')
const { setTimeout: delay } = require('timers/promises')
const { numberPadLeft } = require('./utils')
const { createCanvas } = require('canvas')

const WIDTH  = 1000
const HEIGHT = 1000

const canvas = createCanvas(WIDTH, HEIGHT)
var colors = null

var frame = 0

// Met à jour le numéro d'image s'il y a eu un redémarrage
while(true) {
	frame++

	if(!existsSync(`images/pixel_${numberPadLeft(frame, 4)}.txt`) && !existsSync(`images/frame-${numberPadLeft(frame, 4)}.png`)
		&& !existsSync(`images/output-${numberPadLeft(frame, 4)}.png`))
		break
}

interval_precision(async function() {
	try {
		// Télécharge la liste des couleurs pour la première fois
		if(!colors) {
			console.log("Downloading colors...")
			colors = await fetchData("https://place-api.zevent.fr/colors")
				.then(a => a.json())
		}

		// Télécharge les données pixel de la ZPlace
		let res = await fetchData("https://place-api.zevent.fr/canvas")
			.then(a => a.bytes())

		let imageFilePng = `frame-${numberPadLeft(frame++, 4)}.png`

		// Converti en image via canvas
		convertToImages(res)

		if(!existsSync("images"))
			await mkdir("images")

		// Ecriture dans le dossier images/
		await writeFile(`images/${imageFilePng}`, canvas.toBuffer("image/png"))

		console.log(`${imageFilePng} created`)
	} catch(ex) {
		console.error(ex)
	}
})

async function fetchData(url) {
	let res = await fetch(url)

	if(!res.ok)
		throw new Error(`${res.status} ${res.statusText}`)
	return res
}

function convertToImages(data) {
	let x = 0
	let y = 0
	let width = 500
	let height = 500

	if(data.length > 250_000)
		width = 1000
	if(data.length > 500_000)
		height = 1000

	const ctx = canvas.getContext("2d")

	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(0, 0, WIDTH, HEIGHT)

	for(let byte of data) {
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
}

async function interval_precision(callback) {
	var date = new Date()

	while(true) {
		await delay(60000 - (new Date().getSeconds() * 1000))
		callback()
	}
}