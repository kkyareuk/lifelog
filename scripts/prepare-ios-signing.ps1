param(
  [Parameter(Mandatory=$true)][string]$CertificatePath,
  [Parameter(Mandatory=$true)][string]$ProfilePath,
  [Parameter(Mandatory=$true)][string]$SigningDirectory,
  [string]$TeamId = '3KH3F66KQ3',
  [string]$BundleId = 'com.drawervillage.app',
  [string]$OpenSsl = 'C:\Program Files\Git\usr\bin\openssl.exe',
  [string]$GitHubCli = 'C:\Program Files\GitHub CLI\gh.exe',
  [switch]$PublishSecrets
)
$ErrorActionPreference = 'Stop'

# Never print private material or pass it in command-line arguments.
function Invoke-Captured([string]$Executable, [string[]]$Arguments, [string]$InputText = '') {
  $info = New-Object System.Diagnostics.ProcessStartInfo
  $info.FileName = $Executable
  $info.Arguments = ($Arguments | ForEach-Object {
    if ($_ -match '"') { throw 'Unsupported quote in argument' }
    '"' + $_ + '"'
  }) -join ' '
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $true
  $info.RedirectStandardInput = $true
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $info
  try {
    [void]$process.Start()
    $stdout = $process.StandardOutput.ReadToEndAsync()
    $stderr = $process.StandardError.ReadToEndAsync()
    if ($InputText) { $process.StandardInput.Write($InputText) }
    $process.StandardInput.Close()
    if (-not $process.WaitForExit(120000)) {
      $process.Kill()
      throw 'Signing operation timed out; private output suppressed.'
    }
    if ($process.ExitCode -ne 0) {
      throw ('Signing operation failed: ' + [IO.Path]::GetFileName($Executable) + ' ' + $Arguments[0] + '; private output suppressed.')
    }
    return $stdout.GetAwaiter().GetResult()
  } finally { $process.Dispose() }
}
function Get-PlistValue($Dictionary, [string]$Name) {
  foreach ($child in $Dictionary.ChildNodes) {
    if ($child.Name -eq 'key' -and $child.InnerText -eq $Name) { return $child.NextSibling }
  }
  return $null
}
function Require([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}
function Unlock-LocalPassword([string]$Path) {
  $secure = Import-Clixml -LiteralPath $Path
  return (New-Object System.Net.NetworkCredential('', $secure)).Password
}

$privateKey = Join-Path $SigningDirectory 'distribution-private-key.pem'
$keyPassword = Join-Path $SigningDirectory 'private-key-password.dpapi.xml'
$p12Path = Join-Path $SigningDirectory 'distribution.p12'
$p12PasswordPath = Join-Path $SigningDirectory 'p12-password.dpapi.xml'
Require (-not (Test-Path -LiteralPath $p12Path)) 'P12 already exists; refusing to overwrite.'
Require (-not (Test-Path -LiteralPath $p12PasswordPath)) 'P12 password already exists; refusing to overwrite.'
foreach ($path in @($CertificatePath,$ProfilePath,$privateKey,$keyPassword)) {
  Require (Test-Path -LiteralPath $path -PathType Leaf) 'A required signing file is missing.'
}
$env:DRAWER_SIGNING_KEY_PASSWORD = Unlock-LocalPassword $keyPassword
try {
  $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertificatePath)
  Require ($cert.NotBefore -le (Get-Date) -and $cert.NotAfter -gt (Get-Date).AddDays(1)) 'Certificate is not currently valid.'
  Require ($cert.Subject -match 'CN=Apple Distribution:') 'Not an Apple Distribution certificate.'
  Require ($cert.Subject -match ('OU=' + [regex]::Escape($TeamId) + '(,|$)')) 'Certificate team mismatch.'
  $certPublic = Invoke-Captured $OpenSsl @('x509','-inform','DER','-in',$CertificatePath,'-pubkey','-noout')
  $keyPublic = Invoke-Captured $OpenSsl @('pkey','-in',$privateKey,'-passin','env:DRAWER_SIGNING_KEY_PASSWORD','-pubout')
  Require (($certPublic -replace '\s','') -eq ($keyPublic -replace '\s','')) 'Certificate does not match the locally generated private key.'

  # Verify CMS signature integrity. -noverify skips CA trust-chain validation;
  # Apple/Xcode will validate distribution trust during the signed build.
  $profileXml = Invoke-Captured $OpenSsl @('cms','-verify','-inform','DER','-in',$ProfilePath,'-noverify')
  $plist = New-Object System.Xml.XmlDocument
  $plist.XmlResolver = $null
  $plist.LoadXml($profileXml)
  $dict = $plist.plist.dict
  $entitlements = Get-PlistValue $dict 'Entitlements'
  Require ((Get-PlistValue $dict 'TeamIdentifier').InnerText.Trim() -eq $TeamId) 'Profile team mismatch.'
  Require ((Get-PlistValue $entitlements 'application-identifier').InnerText -eq ($TeamId + '.' + $BundleId)) 'Profile app identifier mismatch.'
  Require ((Get-PlistValue $entitlements 'get-task-allow').Name -eq 'false') 'Development profile is not valid for distribution.'
  Require ((Get-PlistValue $entitlements 'beta-reports-active').Name -eq 'true') 'Profile is not App Store/TestFlight distribution.'
  Require ($null -eq (Get-PlistValue $dict 'ProvisionedDevices')) 'Ad-hoc/device profile is not valid for App Store upload.'
  Require ($null -eq (Get-PlistValue $dict 'ProvisionsAllDevices')) 'Enterprise profile is not valid for App Store upload.'
  $expiration = [DateTimeOffset]::Parse((Get-PlistValue $dict 'ExpirationDate').InnerText)
  Require ($expiration -gt [DateTimeOffset]::Now.AddDays(1)) 'Profile expired or expires within one day.'
  $profileCerts = @( (Get-PlistValue $dict 'DeveloperCertificates').ChildNodes | Where-Object { $_.Name -eq 'data' } )
  Require ($profileCerts.Count -eq 1) 'Unexpected distribution certificate count.'
  $profileCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(,[Convert]::FromBase64String($profileCerts[0].InnerText))
  Require ($profileCert.Thumbprint -eq $cert.Thumbprint) 'Profile references a different certificate.'

  if ($PublishSecrets) {
    $existing = @( (Invoke-Captured $GitHubCli @('secret','list','--repo','kkyareuk/lifelog','--json','name') | ConvertFrom-Json) | ForEach-Object { $_.name } )
    foreach ($name in @('IOS_DISTRIBUTION_P12_BASE64','IOS_DISTRIBUTION_P12_PASSWORD','IOS_PROVISION_PROFILE_BASE64')) {
      Require (-not ($existing -contains $name)) ('Secret already exists; refusing to replace ' + $name)
    }
  }
  $random = New-Object byte[] 48
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($random) } finally { $rng.Dispose() }
  $env:DRAWER_SIGNING_P12_PASSWORD = [Convert]::ToBase64String($random)
  ConvertTo-SecureString $env:DRAWER_SIGNING_P12_PASSWORD -AsPlainText -Force | Export-Clixml -LiteralPath $p12PasswordPath
  # OpenSSL accepts the DER certificate. Both the input key and P12 are encrypted.
  $null = Invoke-Captured $OpenSsl @('pkcs12','-export','-inkey',$privateKey,'-passin','env:DRAWER_SIGNING_KEY_PASSWORD','-in',$CertificatePath,'-out',$p12Path,'-passout','env:DRAWER_SIGNING_P12_PASSWORD','-name','Drawer Village Apple Distribution')
  $null = Invoke-Captured $OpenSsl @('pkcs12','-in',$p12Path,'-passin','env:DRAWER_SIGNING_P12_PASSWORD','-info','-noout')
  if ($PublishSecrets) {
    $null = Invoke-Captured $GitHubCli @('secret','set','IOS_DISTRIBUTION_P12_BASE64','--repo','kkyareuk/lifelog') ([Convert]::ToBase64String([IO.File]::ReadAllBytes($p12Path)))
    $null = Invoke-Captured $GitHubCli @('secret','set','IOS_DISTRIBUTION_P12_PASSWORD','--repo','kkyareuk/lifelog') $env:DRAWER_SIGNING_P12_PASSWORD
    $null = Invoke-Captured $GitHubCli @('secret','set','IOS_PROVISION_PROFILE_BASE64','--repo','kkyareuk/lifelog') ([Convert]::ToBase64String([IO.File]::ReadAllBytes($ProfilePath)))
    Write-Output 'PASS: three signing secrets stored in GitHub Actions; no secret values printed.'
  }
  Write-Output ('PASS: certificate/private key/profile match; App Store profile for ' + $BundleId + '; encrypted P12 verified.')
  Write-Output ('Certificate expires: ' + $cert.NotAfter.ToString('yyyy-MM-dd') + '; profile expires: ' + $expiration.ToString('yyyy-MM-dd'))
} finally {
  Remove-Item Env:DRAWER_SIGNING_KEY_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:DRAWER_SIGNING_P12_PASSWORD -ErrorAction SilentlyContinue
}
