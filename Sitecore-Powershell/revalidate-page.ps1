# Script to revalidate Next.js pages based on Sitecore item

function Get-PageDetails {
    param(
        [Parameter(Mandatory = $true)]
        [Sitecore.Data.Items.Item]$Item
    )

    # Get the "Revalidate Plugin Configuration" item
    $configItem = Get-Item -Path "master:" -ID "{1FD49D13-CFB4-459D-BFAB-A8C3024686A5}"
    
    if (-not $configItem) {
        Write-Error "Revalidate Plugin Configuration item not found."
        return $null
    }

    $itemPath = $Item.Paths.FullPath

    # Iterate through children of the configuration item
    foreach ($childItem in $configItem.Children) {
        $referencedItemID = $childItem.Fields["Site Root"].Value
        $siteRootItem = Get-Item -Path "master:" -ID $referencedItemID
        if ($siteRootItem -and $itemPath.StartsWith($siteRootItem.Paths.FullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $siteUrl = $childItem.Fields["Revalidate API Url"].Value
            $secret = $childItem.Fields["Secret"].Value
            
            $relativePath = $itemPath.Substring($siteRootItem.Paths.FullPath.Length)
            
            $relativePath = $relativePath -ireplace '^/home(?=/|$)', ''
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = "/"
            } 
            
            $relativePath = $relativePath.ToLower() -replace '\s+', '-'
            
            return @{
                SiteUrl      = $siteUrl
                Secret       = $secret
                RelativePath = $relativePath
            }
        }
    }

    return $null
}

$item = Get-Item .
if (-not $item.Fields["__Renderings"]) {
    Show-Alert "This item has no presentation elements."
    Exit
}

$pageDetails = Get-PageDetails -Item $item

if (-not $pageDetails) {
    Show-Alert "Unable to determine the configuration for this item..."
    Exit
}

$apiUrl = $pageDetails.SiteUrl
$secret = $pageDetails.Secret
$relativePath = $pageDetails.RelativePath

if (-not $relativePath) {
    Show-Alert "Unable to determine the relative path for this item..."
    Exit
}

$body = @{
    pages = @($relativePath)
} | ConvertTo-Json

try {
    $uri = [System.Uri]$apiUrl
    $encodedSecret = [System.Web.HttpUtility]::UrlEncode($secret)
    $postUrl = "https://{0}:{1}{2}?secret={3}" -f $uri.Host, 443, $uri.PathAndQuery, $encodedSecret
    
    $response = Invoke-RestMethod -Uri $postUrl -Method Post -Body $body -ContentType "application/json"
    
    if (!$response.revalidated) {
        Show-Alert "Revalidation Failed. The API responded, but revalidation was not successful."
    }
}
catch {
    $errorMessage = "Error during revalidation: $_"
    Show-Alert "Revalidation Error $errorMessage"
}
