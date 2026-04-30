$ErrorActionPreference = 'Continue'
$files = Get-ChildItem -Path ".\src" -Recurse -Filter "*.js"

$count = 0
foreach ($file in $files) {
    Write-Host "Converting: $($file.Name)"
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Convert import { X, Y } from 'module';
    $content = $content -replace "import\s+\{([^}]+)\}\s+from\s+['``]([^'``]+)['``];", 'const {$1} = require(''$2'');'
    
    # Convert import X from 'module';
    $content = $content -replace "import\s+(\w+)\s+from\s+['``]([^'``]+)['``];", 'const $1 = require(''$2'');'
    
    # Convert export class/function/const/let/var
    $content = $content -replace "export\s+(class|function|const|let|var)\s+", '$1 '
    
    # Convert export default
    $content = $content -replace "export\s+default\s+", 'module.exports = '
    
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
    $count++
}

Write-Host "`n✅ Successfully converted $count files!"
