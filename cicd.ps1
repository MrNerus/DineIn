$sourcePath = "D:\Angular\DineIn"
$deployPath = "D:\Angular\DineIn-ghPage"
$distPath   = "$sourcePath\dist\myapp\browser"


Set-Location $sourcePath
git add .
$commitMsg = Read-Host "Enter commit message for source repo"
git commit -m "$commitMsg"
git push

ng build --configuration production

Set-Location $deployPath
Get-ChildItem -Path $deployPath -Recurse | Where-Object {
    $_.Name -notin @(".git", ".gitignore", ".nojekyll", "CNAME")
} | Remove-Item -Recurse -Force

Copy-Item -Path "$distPath\*" -Destination $deployPath -Recurse

Copy-Item "$deployPath\index.html" "$deployPath\404.html" -Force

git add .
$commitMsg = Read-Host "Enter commit message for gh-pages repo"
git commit -m "$commitMsg"
git push

Set-Location $sourcePath

Write-Host "✅ Deployment complete!"