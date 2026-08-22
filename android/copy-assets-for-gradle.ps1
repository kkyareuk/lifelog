param(
    [Parameter(Mandatory = $true)]
    [string]$Source,

    [Parameter(Mandatory = $true)]
    [string]$WebSource,

    [Parameter(Mandatory = $true)]
    [string]$Destination
)

$ErrorActionPreference = 'Stop'

$sourceRoot = [System.IO.Path]::GetFullPath($Source).TrimEnd('\')
$webSourceRoot = [System.IO.Path]::GetFullPath($WebSource).TrimEnd('\')
$destinationRoot = [System.IO.Path]::GetFullPath($Destination).TrimEnd('\')
$expectedRoot = [System.IO.Path]::GetFullPath('C:\Users\Public\drawervillage-android-assets')

if (-not $destinationRoot.StartsWith($expectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to replace an unexpected asset directory: $destinationRoot"
}

if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "Android asset source directory is missing: $sourceRoot"
}

if (-not (Test-Path -LiteralPath $webSourceRoot -PathType Container)) {
    throw "Prepared web asset directory is missing: $webSourceRoot"
}

# This folder is a generated build cache only. Recreate it so removed web files
# cannot remain inside a later APK.
if (Test-Path -LiteralPath $destinationRoot) {
    Remove-Item -LiteralPath $destinationRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null

Get-ChildItem -LiteralPath $sourceRoot -File -Force | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceRoot.Length).TrimStart('\')
    $destinationFile = Join-Path $destinationRoot $relativePath
    $destinationDirectory = Split-Path -Parent $destinationFile
    if (-not (Test-Path -LiteralPath $destinationDirectory)) {
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    }

    # Read and write bytes instead of Copy-Item so OneDrive reparse metadata is
    # never propagated into Gradle's input directory.
    [System.IO.File]::WriteAllBytes(
        $destinationFile,
        [System.IO.File]::ReadAllBytes($_.FullName)
    )
}


# Capacitor's copy command can return success after OneDrive blocks deletion of
# an existing reparse-point file. Package the prepared `www` directory directly
# so a partial android/app/src/main/assets/public tree can never reach an APK.
$publicDestination = Join-Path $destinationRoot 'public'
Get-ChildItem -LiteralPath $webSourceRoot -Recurse -File -Force | ForEach-Object {
    $relativePath = $_.FullName.Substring($webSourceRoot.Length).TrimStart('\')
    $destinationFile = Join-Path $publicDestination $relativePath
    $destinationDirectory = Split-Path -Parent $destinationFile
    if (-not (Test-Path -LiteralPath $destinationDirectory)) {
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    }

    [System.IO.File]::WriteAllBytes(
        $destinationFile,
        [System.IO.File]::ReadAllBytes($_.FullName)
    )
}

$sourceCount = (Get-ChildItem -LiteralPath $webSourceRoot -Recurse -File -Force).Count
$stagedCount = (Get-ChildItem -LiteralPath $publicDestination -Recurse -File -Force).Count
if ($sourceCount -ne $stagedCount) {
    throw "Android web asset staging is incomplete: source=$sourceCount staged=$stagedCount"
}
