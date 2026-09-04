param([Parameter(Mandatory=$true)][string]$Bundle)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$webRoot=[System.IO.Path]::GetFullPath((Join-Path $projectRoot 'www'))
$bundlePath=(Resolve-Path -LiteralPath $Bundle).Path
$archive=[System.IO.Compression.ZipFile]::OpenRead($bundlePath)
try {
  $files=Get-ChildItem -LiteralPath $webRoot -Recurse -File
  foreach($file in $files){
    $relative=$file.FullName.Substring($webRoot.Length+1).Replace('\','/')
    $entry=$archive.GetEntry('base/assets/public/'+$relative)
    if(-not $entry){throw "Missing bundled asset: $relative"}
    $stream=$entry.Open()
    try {$hash=[System.Security.Cryptography.SHA256]::Create();$actual=[BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-','')}
    finally {$stream.Dispose();$hash.Dispose()}
    if($actual -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash){throw "Stale bundled asset: $relative"}
  }
  if(-not ($archive.Entries | Where-Object FullName -Match '^META-INF/.+\.(RSA|EC|DSA)$')){throw 'Bundle signing entry missing'}
  Write-Output "PASS: $($files.Count) prepared web assets match the signed Android bundle byte-for-byte."
  Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256 | Format-List
} finally {$archive.Dispose()}
