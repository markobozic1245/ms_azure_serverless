const { BlobServiceClient } = require("@azure/storage-blob"); // Ensure this is installed

console.log("Azure Blob storage v12 - JavaScript quickstart sample");

module.exports = async function (context, myBlob) {
  context.log(
    "JavaScript blob trigger function processed blob \n Blob:",
    context.bindingData.blobTrigger,
    "\n Blob Size:",
    myBlob.length,
    "Bytes"
  );

  const connectionString = process.env.AzureWebJobsStorage; // Storage connection string

  context.log("Connection string:", connectionString);

  const inputContainerName = "input"; // Input container name

  context.log("Input container name:", inputContainerName);

  const outputContainerName = "output"; // Output container name
  const blobName = context.bindingData.name; // Blob name (from trigger)

  context.log("Output container name:", outputContainerName);

  try {
    // Create BlobServiceClient
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    // Get the container clients
    const inputContainerClient =
      blobServiceClient.getContainerClient(inputContainerName);
    const outputContainerClient =
      blobServiceClient.getContainerClient(outputContainerName);

    // Get the blob client for the input blob
    const inputBlobClient = inputContainerClient.getBlobClient(blobName);

    // Get the blob client for the output blob
    const outputBlobClient = outputContainerClient.getBlobClient(blobName);

    // Copy the blob from input to output container
    const copyPoller = await outputBlobClient.beginCopyFromURL(
      inputBlobClient.url
    );
    await copyPoller.pollUntilDone();
    context.log(`Blob successfully copied to output container: ${blobName}`);

    // Delete the blob from the input container
    await inputBlobClient.delete();
    context.log(`Blob successfully deleted from input container: ${blobName}`);
  } catch (error) {
    context.log.error("Error processing blob:", error.message);
  }
};
