# Script to convert ES6 import/export to CommonJS require/module.exports
$files = Get-ChildItem -Path "c:\Users\Yusuf\Desktop\Yazılımsal\newqrmenu\backend\src" -Recurse -Filter "*.js"

foreach ($file in $files) {
    Write-Host "Converting $($file.Name)..."
    $content = Get-Content $file.FullName -Raw
    
    # Convert import statements
    # import { X } from 'module';
    $content = $content -replace "import\s*\{([^}]+)\}\s*from\s*['`]([^'`]+)['`"];", 'const {$1} = require(''$2'');'
    
    # Convert default exports  
    # export default X;
    $content = $content -replace "export\s+default\s+", 'module.exports = '
    
    # Convert named exports
    # export class X
    # export function X
    # export const X
    $content = $content -replace "export\s+(class|function|const|let|var)\s+", '$1 '
    
    # Save the file
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "  Done"
}

Write-Host "`nAll files converted!"
