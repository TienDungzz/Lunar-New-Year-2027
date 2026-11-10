$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
function Export-BrandPng([string]$source, [string]$target, [int]$size) {
    $original = [System.Drawing.Image]::FromFile((Join-Path $projectRoot $source))
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($original, 0, 0, $size, $size)
        $bitmap.Save((Join-Path $projectRoot $target), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
        $original.Dispose()
    }
}
Export-BrandPng 'public/images/goat-mark.png' 'public/favicon-32.png' 32
Export-BrandPng 'public/images/goat-mark.png' 'public/apple-touch-icon.png' 180
