param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\theme-assets\moonlit-drawer-png")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

function New-RoundedPath {
  param(
    [System.Drawing.RectangleF]$Bounds,
    [float]$Radius
  )
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = [Math]::Max(1, $Radius * 2)
  $arc = [System.Drawing.RectangleF]::new($Bounds.X, $Bounds.Y, $diameter, $diameter)
  $path.AddArc($arc, 180, 90)
  $arc.X = $Bounds.Right - $diameter
  $path.AddArc($arc, 270, 90)
  $arc.Y = $Bounds.Bottom - $diameter
  $path.AddArc($arc, 0, 90)
  $arc.X = $Bounds.X
  $path.AddArc($arc, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-Canvas {
  param([int]$Width, [int]$Height)
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bitmap.SetResolution(144, 144)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Canvas {
  param($Canvas, [string]$FileName)
  $path = Join-Path $resolvedOutput $FileName
  $Canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Canvas.Graphics.Dispose()
  $Canvas.Bitmap.Dispose()
  Write-Host "created $path"
}

function New-GradientBrush {
  param(
    [System.Drawing.RectangleF]$Bounds,
    [string]$Start,
    [string]$End,
    [float]$Angle = 90
  )
  return [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $Bounds,
    [System.Drawing.ColorTranslator]::FromHtml($Start),
    [System.Drawing.ColorTranslator]::FromHtml($End),
    $Angle
  )
}

function Draw-CornerFlourish {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$ScaleX,
    [float]$ScaleY
  )
  $gold = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml("#cba95d"), 3)
  $gold.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $gold.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddBezier(
    $X, $Y + (22 * $ScaleY),
    $X + (15 * $ScaleX), $Y + (22 * $ScaleY),
    $X + (20 * $ScaleX), $Y + (14 * $ScaleY),
    $X + (22 * $ScaleX), $Y
  )
  $path.AddBezier(
    $X + (4 * $ScaleX), $Y + (18 * $ScaleY),
    $X + (15 * $ScaleX), $Y + (18 * $ScaleY),
    $X + (18 * $ScaleX), $Y + (12 * $ScaleY),
    $X + (18 * $ScaleX), $Y + (4 * $ScaleY)
  )
  $Graphics.DrawPath($gold, $path)
  $path.Dispose()
  $gold.Dispose()
}

function Draw-PanelFrame {
  $canvas = New-Canvas -Width 192 -Height 192
  $g = $canvas.Graphics
  $outerBounds = [System.Drawing.RectangleF]::new(4, 4, 184, 184)
  $outerPath = New-RoundedPath -Bounds $outerBounds -Radius 28
  $outerBrush = New-GradientBrush -Bounds $outerBounds -Start "#1a3268" -End "#0b1835" -Angle 90
  $g.FillPath($outerBrush, $outerPath)
  $outerBrush.Dispose()

  $goldPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml("#d4b76b"), 3)
  $g.DrawPath($goldPen, $outerPath)
  $goldPen.Dispose()
  $outerPath.Dispose()

  $paperBounds = [System.Drawing.RectangleF]::new(18, 18, 156, 156)
  $paperPath = New-RoundedPath -Bounds $paperBounds -Radius 18
  $paperBrush = New-GradientBrush -Bounds $paperBounds -Start "#fffdf7" -End "#f4e9d2" -Angle 90
  $g.FillPath($paperBrush, $paperPath)
  $paperBrush.Dispose()
  $innerPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml("#e4cb88"), 2)
  $g.DrawPath($innerPen, $paperPath)
  $innerPen.Dispose()
  $paperPath.Dispose()

  Draw-CornerFlourish -Graphics $g -X 21 -Y 21 -ScaleX 1 -ScaleY 1
  Draw-CornerFlourish -Graphics $g -X 171 -Y 21 -ScaleX -1 -ScaleY 1
  Draw-CornerFlourish -Graphics $g -X 21 -Y 171 -ScaleX 1 -ScaleY -1
  Draw-CornerFlourish -Graphics $g -X 171 -Y 171 -ScaleX -1 -ScaleY -1
  Save-Canvas -Canvas $canvas -FileName "panel-frame.png"
}

function Draw-CardFrame {
  $canvas = New-Canvas -Width 128 -Height 128
  $g = $canvas.Graphics
  $bounds = [System.Drawing.RectangleF]::new(4, 4, 120, 120)
  $path = New-RoundedPath -Bounds $bounds -Radius 22
  $paper = New-GradientBrush -Bounds $bounds -Start "#fffef9" -End "#f3e7ce" -Angle 105
  $g.FillPath($paper, $path)
  $paper.Dispose()
  $navy = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml("#203969"), 5)
  $g.DrawPath($navy, $path)
  $navy.Dispose()
  $gold = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml("#d2b76d"), 2)
  $inner = New-RoundedPath -Bounds ([System.Drawing.RectangleF]::new(12, 12, 104, 104)) -Radius 15
  $g.DrawPath($gold, $inner)
  $gold.Dispose()
  $inner.Dispose()
  $path.Dispose()
  Save-Canvas -Canvas $canvas -FileName "card-frame.png"
}

function Draw-ButtonFrame {
  param([string]$FileName, [bool]$Selected)
  $canvas = New-Canvas -Width 240 -Height 96
  $g = $canvas.Graphics
  $bounds = [System.Drawing.RectangleF]::new(4, 4, 232, 88)
  $path = New-RoundedPath -Bounds $bounds -Radius 26
  if ($Selected) {
    $fill = New-GradientBrush -Bounds $bounds -Start "#31518f" -End "#142956" -Angle 90
    $edgeColor = "#f8edcf"
    $innerColor = "#d7b866"
  } else {
    $fill = New-GradientBrush -Bounds $bounds -Start "#fffef9" -End "#eee3cd" -Angle 90
    $edgeColor = "#203969"
    $innerColor = "#d2b76d"
  }
  $g.FillPath($fill, $path)
  $fill.Dispose()
  $edge = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($edgeColor), 5)
  $g.DrawPath($edge, $path)
  $edge.Dispose()
  $inner = New-RoundedPath -Bounds ([System.Drawing.RectangleF]::new(12, 12, 216, 72)) -Radius 18
  $innerPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($innerColor), 2)
  $g.DrawPath($innerPen, $inner)
  $innerPen.Dispose()
  $inner.Dispose()
  $path.Dispose()
  Save-Canvas -Canvas $canvas -FileName $FileName
}

function Draw-TabFrame {
  param([string]$FileName, [bool]$Selected)
  $canvas = New-Canvas -Width 200 -Height 72
  $g = $canvas.Graphics
  $bounds = [System.Drawing.RectangleF]::new(3, 3, 194, 66)
  $path = New-RoundedPath -Bounds $bounds -Radius 18
  if ($Selected) {
    $fill = New-GradientBrush -Bounds $bounds -Start "#2f4e89" -End "#142956" -Angle 90
    $edgeColor = "#d6b967"
  } else {
    $fill = New-GradientBrush -Bounds $bounds -Start "#fffef9" -End "#f0e6d4" -Angle 90
    $edgeColor = "#b9a777"
  }
  $g.FillPath($fill, $path)
  $fill.Dispose()
  $edge = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($edgeColor), 4)
  $g.DrawPath($edge, $path)
  $edge.Dispose()
  $path.Dispose()
  Save-Canvas -Canvas $canvas -FileName $FileName
}

Draw-PanelFrame
Draw-CardFrame
Draw-ButtonFrame -FileName "button-default.png" -Selected $false
Draw-ButtonFrame -FileName "button-selected.png" -Selected $true
Draw-TabFrame -FileName "tab-default.png" -Selected $false
Draw-TabFrame -FileName "tab-selected.png" -Selected $true

