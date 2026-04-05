const sharp = require('sharp')
const fetch = require('node-fetch')

module.exports = async (event, context) => {
  try {
    let fileName

    // Case 1: MinIO webhook (JSON)
    if (event.body) {
      const body = JSON.parse(event.body)

      if (body.Records && body.Records.length > 0) {
        fileName = body.Records[0].s3.object.key
      }
    }

    // Case 2: direct call fallback
    if (!fileName && typeof event.body === "string") {
      fileName = event.body.trim()
    }

    if (!fileName) {
      throw new Error("File name not found in event")
    }

    const url = `http://172.23.232.175:9000/images/${fileName}`

    console.log("Fetching:", url)

    const response = await fetch(url)

    console.log("Status:", response.status)

    if (!response.ok) {
      throw new Error("Failed to fetch image")
    }

    const buffer = await response.buffer()

    await sharp(buffer)
      .resize(100, 100)
      .toBuffer()

    console.log("Image processed:", fileName)

    return {
      statusCode: 200,
      body: "Success"
    }

  } catch (err) {
    console.error("ERROR:", err.message)
    return {
      statusCode: 500,
      body: err.message
    }
  }
}
