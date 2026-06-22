export async function GET() {
  return Response.json({
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  })
}
