using Azure.Storage.Blobs;

namespace Server.Helpers
{
    public class AzureBlobStorageHelper
    {
        private readonly string _connectionString;
        private readonly string _containerName = "coursedata";

        public AzureBlobStorageHelper(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<string> UploadFileAsync(IFormFile file)
        {
            try
            {
                var blobServiceClient = new BlobServiceClient(_connectionString);
                var blobContainerClient = blobServiceClient.GetBlobContainerClient(_containerName);

                await blobContainerClient.CreateIfNotExistsAsync();

                var blobName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);

                var blobClient = blobContainerClient.GetBlobClient(blobName);

                using (var stream = file.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, overwrite: true);
                }

                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                throw new Exception("File upload failed.", ex);
            }
        }
    }
}
