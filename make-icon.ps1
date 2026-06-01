Add-Type -AssemblyName System.Drawing

# Take the AlFit icon design and recolor the neon green to AthleteOS brand green (#22C55E).
# Keeps the dark background and anti-aliased edges intact.

$srcDir = "C:\Users\Alki\Desktop\AlFit"
$dstDir = $PSScriptRoot

# Brand green
$brandR = 0x22; $brandG = 0xC5; $brandB = 0x5E

function Convert-Icon {
  param([string]$SrcPath, [string]$DstPath)

  $src = [System.Drawing.Bitmap]::FromFile($SrcPath)
  # Make a writable copy in 32bpp ARGB
  $w = $src.Width; $h = $src.Height
  $dst = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.DrawImage($src, 0, 0, $w, $h)
  $g.Dispose()
  $src.Dispose()

  $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $data = $dst.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite,
                        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $h)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  # First pass: find the brightest green pixel (to know the source "neon green" RGB)
  # and the darkest pixel (to know the source background RGB).
  $maxG = 0; $maxR = 0; $maxB = 0
  $minR = 255; $minG = 255; $minB = 255
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
      $i = $row + $x * 4
      $b = $bytes[$i]; $gC = $bytes[$i+1]; $r = $bytes[$i+2]
      # Track brightest green-dominant pixel
      if ($gC -gt $maxG -and $gC -gt $r -and $gC -gt $b) {
        $maxG = $gC; $maxR = $r; $maxB = $b
      }
      # Track darkest pixel
      $lum = $r + $gC + $b
      $minLum = $minR + $minG + $minB
      if ($lum -lt $minLum) {
        $minR = $r; $minG = $gC; $minB = $b
      }
    }
  }

  Write-Output ("src dark: ({0},{1},{2})  src green: ({3},{4},{5})" -f $minR,$minG,$minB,$maxR,$maxG,$maxB)

  $rangeG = [double]($maxG - $minG)
  if ($rangeG -lt 1) { $rangeG = 1 }

  # Second pass: rewrite green-leaning pixels by lerping between dark and brand green.
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
      $i = $row + $x * 4
      $b = $bytes[$i]; $gC = $bytes[$i+1]; $r = $bytes[$i+2]

      # Alpha = how green this pixel is, from 0 (dark) to 1 (full neon green)
      $a = ($gC - $minG) / $rangeG
      if ($a -lt 0) { $a = 0 } elseif ($a -gt 1) { $a = 1 }

      # Only remap pixels that are actually green-dominant; leave near-black untouched
      if ($gC -gt $r -and $gC -gt $b -and $a -gt 0.02) {
        $nr = [int]([math]::Round($minR + ($brandR - $minR) * $a))
        $ng = [int]([math]::Round($minG + ($brandG - $minG) * $a))
        $nb = [int]([math]::Round($minB + ($brandB - $minB) * $a))
        if ($nr -lt 0) {$nr=0} elseif ($nr -gt 255) {$nr=255}
        if ($ng -lt 0) {$ng=0} elseif ($ng -gt 255) {$ng=255}
        if ($nb -lt 0) {$nb=0} elseif ($nb -gt 255) {$nb=255}
        $bytes[$i]   = [byte]$nb
        $bytes[$i+1] = [byte]$ng
        $bytes[$i+2] = [byte]$nr
      }
    }
  }

  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  $dst.UnlockBits($data)
  $dst.Save($DstPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
}

Convert-Icon -SrcPath "$srcDir\icon-512.png" -DstPath "$dstDir\icon-512.png"
Convert-Icon -SrcPath "$srcDir\icon-192.png" -DstPath "$dstDir\icon-192.png"
Write-Output "done"
