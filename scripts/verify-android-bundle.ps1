param([Parameter(Mandatory=$true)][string]$Bundle)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$webRoot=[System.IO.Path]::GetFullPath((Join-Path $projectRoot 'www'))
$bundlePath=(Resolve-Path -LiteralPath $Bundle).Path
$archive=[System.IO.Compression.ZipFile]::OpenRead($bundlePath)
try {
  # ZIP tools may store Korean file names with a different Unicode
  # normalization form than NTFS. Compare normalized names so a valid bundled
  # font is not reported missing solely because its bytes spell the same name
  # in decomposed form.
  $entries=@{}
  foreach($archiveEntry in $archive.Entries){$entries[$archiveEntry.FullName.Normalize([Text.NormalizationForm]::FormC)]=$archiveEntry}
  $files=Get-ChildItem -LiteralPath $webRoot -Recurse -File
  foreach($file in $files){
    $relative=$file.FullName.Substring($webRoot.Length+1).Replace('\','/')
    $expected=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $entry=$entries[('base/assets/public/'+$relative).Normalize([Text.NormalizationForm]::FormC)]
    if(-not $entry){
      # Some Java/ZIP combinations expose legacy-encoded Korean entry names to
      # .NET even though Android reads the UTF-8 asset correctly. Fall back to
      # byte identity among same-sized packaged assets instead of trusting the
      # decoded display name.
      foreach($candidate in ($archive.Entries | Where-Object Length -EQ $file.Length)){
        $candidateStream=$candidate.Open()
        try {$candidateHasher=[System.Security.Cryptography.SHA256]::Create();$candidateHash=[BitConverter]::ToString($candidateHasher.ComputeHash($candidateStream)).Replace('-','')}
        finally {$candidateStream.Dispose();$candidateHasher.Dispose()}
        if($candidateHash -eq $expected){$entry=$candidate;break}
      }
    }
    if(-not $entry){throw "Missing bundled asset: $relative"}
    $stream=$entry.Open()
    try {$hash=[System.Security.Cryptography.SHA256]::Create();$actual=[BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-','')}
    finally {$stream.Dispose();$hash.Dispose()}
    if($actual -ne $expected){throw "Stale bundled asset: $relative"}
  }
  if(-not ($archive.Entries | Where-Object FullName -Match '^META-INF/.+\.(RSA|EC|DSA)$')){throw 'Bundle signing entry missing'}
  Write-Output "PASS: $($files.Count) prepared web assets match the signed Android bundle byte-for-byte."
  Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256 | Format-List
} finally {$archive.Dispose()}
