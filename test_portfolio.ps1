$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJkZW1vdXNlciIsImVtYWlsIjoiZGVtb0B0ZXN0LmNvbSIsImlhdCI6MTc0OTA3Nzg2NCwiZXhwIjoxNzQ5MTY0MjY0fQ.c93EUVgFyLu2J8FHibjb94SPshiSvs9sRjSTcGc4YpI"

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/portfolio" -Method GET -Headers $headers
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Content:"
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}