# Script to revalidate Next.js pages based on Sitecore item
$secret = "welcome!"
$sitePathUrlMapping = @{
    "/sitecore/content/Starter Kit/Bennett Jones" = "https://vercel-isr-test.vercel.app/api/revalidate"
    "/sitecore/content/Starter Kit/Default"       = "https://vercel-isr-test.vercel.app/api/revalidate"
    "/sitecore/content/Starter Kit/DGA"           = "https://vercel-isr-test.vercel.app/api/revalidate"
    "/sitecore/content/Starter Kit/Xcentium"      = "https://vercel-isr-test.vercel.app/api/revalidate"
}

function Get-PageDetails {
    param(
        [Parameter(Mandatory = $true)]
        [Sitecore.Data.Items.Item]$Item
    )
    $itemPath = $Item.Paths.FullPath
    foreach ($sitePath in $sitePathUrlMapping.Keys) {
        if ($itemPath.StartsWith($sitePath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $siteUrl = $sitePathUrlMapping[$sitePath]
            $relativePath = $itemPath.Substring($sitePath.Length)
            
            $relativePath = $relativePath -ireplace '^/home(?=/|$)', ''
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = "/"
            } 
            
            $relativePath = $relativePath.ToLower() -replace '\s+', '-'
            
            return @{
                SiteUrl      = $siteUrl
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
$apiUrl = $pageDetails.SiteUrl
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
    
    if ($response.revalidated) {
        $revalidatedPages = $response.pages -join ", "
        #$message = "Successfully revalidated page: $revalidatedPages`nTimestamp: $($response.now)"
        #Show-Alert ("Revalidation Successful. " + $message)
    }
    else {
        Show-Alert "Revalidation Failed. The API responded, but revalidation was not successful."
    }
}
catch {
    $errorMessage = "Error during revalidation: $_"
    Show-Alert "Revalidation Error $errorMessage"
}