param(
    [Parameter(Mandatory = $true)]
    [string]$Source,

    [Parameter(Mandatory = $true)]
    [string]$Destination
)

$ErrorActionPreference = 'Stop'

$sourceRoot = [System.IO.Path]::GetFullPath($Source).TrimEnd('\')
$destinationRoot = [System.IO.Path]::GetFullPath($Destination).TrimEnd('\')
$expectedRoot = [System.IO.Path]::GetFullPath('C:\Users\Public\drawervillage-android-assets')

if (-not $destinationRoot.StartsWith($expectedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to replace an unexpected asset directory: $destinationRoot"
}

if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "Android asset source directory is missing: $sourceRoot"
}

# This folder is a generated build cache only. Recreate it so removed web files
# cannot remain inside a later APK.
if (Test-Path -LiteralPath $destinationRoot) {
    Remove-Item -LiteralPath $destinationRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null

Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force | ForEach-Object {
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
