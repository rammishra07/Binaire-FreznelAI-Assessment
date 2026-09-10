@echo off
echo =======================================================
echo Task 1 & Submission: GitHub Automation Script
echo =======================================================
echo.

set /p REPO_URL="Enter the GitHub Assessment Repo URL (e.g. https://github.com/org/assessment-repo): "

if "%REPO_URL%"=="" (
    echo Error: Repo URL cannot be empty.
    exit /b 1
)

echo [1/3] Starring repository via GitHub CLI...
gh repo star %REPO_URL%

echo [2/3] Forking assessment repository as Binaire-FreznelAI-Assessment...
gh repo fork %REPO_URL% --fork-name Binaire-FreznelAI-Assessment --clone=false

echo [3/3] Initializing local repository and pushing to Binaire_Freznel_Assessment...
git init
git add .
git commit -m "feat: complete Model Selection Utility assessment (Binaire_Freznel_Assessment)"
git branch -M main

echo.
echo Please enter your target GitHub username:
set /p GH_USER="GitHub Username: "

git remote add origin https://github.com/%GH_USER%/Binaire_Freznel_Assessment.git
git push -u origin main

echo.
echo =======================================================
echo GitHub Assessment Tasks Completed Successfully!
echo =======================================================
