param(
  [Parameter(Mandatory = $true)]
  [string]$SourceDirectory
)

# Deterministic crop-only pipeline for the owner's source sheets.
# It never redraws or generates imagery. The same rectangle is used for the
# visible building and its light layer so transforms stay perfectly aligned.
Add-Type -AssemblyName System.Drawing

function Export-OwnerLayer {
  param(
    [string]$InputPath,
    [Drawing.Rectangle]$Crop,
    [string]$OutputPath,
    [int]$OutputWidth = 640
  )

  $source = [Drawing.Bitmap]::new($InputPath)
  try {
    $clipped = $source.Clone($Crop, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $clipped.MakeTransparent([Drawing.Color]::White)
      $outputHeight = [Math]::Max(1, [int][Math]::Round($clipped.Height * ($OutputWidth / [double]$clipped.Width)))
      $resized = [Drawing.Bitmap]::new($OutputWidth, $outputHeight, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $graphics = [Drawing.Graphics]::FromImage($resized)
        try {
          $graphics.Clear([Drawing.Color]::Transparent)
          $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
          $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
          $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
          $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
          $graphics.DrawImage($clipped, [Drawing.Rectangle]::new(0, 0, $OutputWidth, $outputHeight))
        } finally {
          $graphics.Dispose()
        }
        $resized.Save($OutputPath, [Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $resized.Dispose()
      }
    } finally {
      $clipped.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

$oldBase = Join-Path $SourceDirectory '일러스트 20260830 (2).png'
$oldLight = Join-Path $SourceDirectory '일러스트 20260830 (4).png'
$newBase = Join-Path $SourceDirectory '일러스트 20260830 (6).png'
$newLight = Join-Path $SourceDirectory '일러스트 20260830 (7).png'
$output = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\world-assets\building-types'))

$items = @(
  @{ Name = 'cafe'; Base = $oldBase; Light = $oldLight; Crop = [Drawing.Rectangle]::new(50, 90, 820, 800) },
  @{ Name = 'hospital'; Base = $oldBase; Light = $oldLight; Crop = [Drawing.Rectangle]::new(940, 80, 760, 850) },
  @{ Name = 'piano-hall'; Base = $newBase; Light = $newLight; Crop = [Drawing.Rectangle]::new(1760, 80, 840, 820) },
  @{ Name = 'park'; Base = $newBase; Light = $newLight; Crop = [Drawing.Rectangle]::new(1660, 1910, 930, 780) },
  @{ Name = 'red-roof-home'; Base = $newBase; Light = $newLight; Crop = [Drawing.Rectangle]::new(5320, 1030, 965, 780) }
)

foreach ($item in $items) {
  Export-OwnerLayer -InputPath $item.Base -Crop $item.Crop -OutputPath (Join-Path $output "$($item.Name)-handdrawn.png")
  Export-OwnerLayer -InputPath $item.Light -Crop $item.Crop -OutputPath (Join-Path $output "$($item.Name)-light.png")
}

Write-Output 'Trimmed cafe, hospital, piano hall, park and red-roof home to exact shared base/light canvases.'
