# Response.json을 NextResponse.json으로 변경하는 스크립트
$basePath = "C:\Project\CoUp\coup"

# 모든 groups API 라우트 파일 찾기
$files = Get-ChildItem -Path "$basePath\src\app\api\groups" -Filter "route.js" -Recurse

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"

    # 파일 읽기
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

    # NextResponse import 추가 (없으면)
    if ($content -notmatch "import.*NextResponse.*from 'next/server'") {
        $content = $content -replace "(import.*from 'next-auth';)", "import { NextResponse } from 'next/server';`r`n`$1"
    }

    # Response.json을 NextResponse.json으로 변경
    $content = $content -replace 'return Response\.json\(', 'return NextResponse.json('

    # 파일 저장
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)

    Write-Host "Completed: $($file.Name)"
}

Write-Host "`nAll files processed!" -ForegroundColor Green

