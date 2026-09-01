param(
  [Parameter(Mandatory = $true)]
  [string]$SourceDirectory
)
$ErrorActionPreference = 'Stop'

# Deterministic crop-only pipeline for the owner's source sheets.
# It never redraws or generates imagery. The same rectangle is used for the
# visible building and its light layer so transforms stay perfectly aligned.
Add-Type -AssemblyName System.Drawing
$drawingReferences = @([Drawing.Bitmap].Assembly.Location, [Drawing.Color].Assembly.Location, [object].Assembly.Location, (Join-Path $PSHOME 'System.Collections.dll'))
Add-Type -ReferencedAssemblies $drawingReferences -TypeDefinition @'
using System;
using System.Drawing;

public static class OwnerArtBackground {
  private static bool IsPaper(Color color) {
    return color.A > 0 && color.R >= 246 && color.G >= 246 && color.B >= 246 &&
      Math.Max(color.R, Math.Max(color.G, color.B)) - Math.Min(color.R, Math.Min(color.G, color.B)) <= 8;
  }
  public static void RemoveConnectedPaper(Bitmap bitmap) {
    int width = bitmap.Width, height = bitmap.Height;
    var seen = new bool[width * height];
    var queue = new int[width * height];
    int head = 0, tail = 0;
    Action<int,int> enqueue = (x,y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      int index = y * width + x;
      if (seen[index] || !IsPaper(bitmap.GetPixel(x,y))) return;
      seen[index] = true; queue[tail++] = index;
    };
    for (int x = 0; x < width; x++) { enqueue(x,0); enqueue(x,height-1); }
    for (int y = 0; y < height; y++) { enqueue(0,y); enqueue(width-1,y); }
    while (head < tail) {
      int index = queue[head++], x = index % width, y = index / width;
      Color source = bitmap.GetPixel(x,y);
      bitmap.SetPixel(x,y,Color.FromArgb(0,source.R,source.G,source.B));
      enqueue(x-1,y); enqueue(x+1,y); enqueue(x,y-1); enqueue(x,y+1);
    }
  }
}
'@

function Export-OwnerLayer {
  param(
    [string]$InputPath,
    [Drawing.Rectangle]$Crop,
    [string]$OutputPath,
    [int]$OutputWidth = 640
  )

  $sourceBytes = [IO.File]::ReadAllBytes([string]$InputPath)
  $sourceStream = [IO.MemoryStream]::new($sourceBytes, $false)
  $source = [Drawing.Bitmap]::new($sourceStream)
  try {
    $clipped = $source.Clone($Crop, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      # Only the paper connected to the crop edge becomes transparent. White
      # paint enclosed by the hospital outline remains opaque.
      [OwnerArtBackground]::RemoveConnectedPaper($clipped)
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
    $sourceStream.Dispose()
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
  $basePath = (Resolve-Path -LiteralPath ([string]$item['Base'])).Path
  $lightPath = (Resolve-Path -LiteralPath ([string]$item['Light'])).Path
  Export-OwnerLayer $basePath ([Drawing.Rectangle]$item['Crop']) (Join-Path $output "$($item.Name)-handdrawn.png")
  Export-OwnerLayer $lightPath ([Drawing.Rectangle]$item['Crop']) (Join-Path $output "$($item.Name)-light.png")
}

Write-Output 'Trimmed cafe, hospital, piano hall, park and red-roof home to exact shared base/light canvases.'
