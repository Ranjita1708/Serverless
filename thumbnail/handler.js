"use strict"

const sharp = require("sharp")
const fetch = require("node-fetch")

module.exports = async (event, context) => {
    try {
        // Handle both string and object formats
        const body = typeof event.body === "string"
            ? JSON.parse(event.body)
            : event.body

        // Extract bucket and file name
        const record = body.Records[0]
        const bucket = record.s3.bucket.name
        const object = record.s3.object.key

        // MinIO file URL (PUBLIC bucket)
        const url = `http://172.23.232.175:9000/${bucket}/${object}`

        // Debug logs
        console.log("Fetching:", url)

        // Fetch image from MinIO
        const response = await fetch(url)

        console.log("Status:", response.status)

        if (!response.ok) {
            throw new Error("Failed to fetch image from MinIO")
        }

        const buffer = await response.buffer()

        // Resize image
        const output = await sharp(buffer)
            .resize(128, 128)
            .toBuffer()

        console.log("Image processed:", object)

        return context
            .status(200)
            .succeed("Thumbnail created successfully")

    } catch (err) {
        console.error("ERROR:", err)
        return context
            .status(500)
            .fail(err.toString())
    }
}
