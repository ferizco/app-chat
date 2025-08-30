# APP-CHAT

## Stack 
- server : Go Fiber 
- Web    : React
- DB     : postgresql

## install backend
- cd server
- go mod tidy
- go run ./cmd/api

## install frontend
- cd web
- npm install
- npm run dev

## DB Migration 
- create user app_chat_user dengan password app-chat
- port db 5432 
- create database app_chat 
- GRANT ALL ON DATABASE app_chat TO app_chat_user;

## user login 
- user: alice, bob, charlie (pilih salah satu)
- pass: 123456


## Workflow 
1. makesure main di lokal selalu update -> git checkout main && git pull origin main
2. jika mau update, bikin branch baru -> git checkout -b namabranch (namatask-namadeveloper)
3. setelah selesai coding, add, commit, and push ke branch baru 
4. req pull request di GitHub, merged branch baru ke main 
5. pastikan tidak ada conflict dan hapus branch tersebut
6. git switch main untuk pindah ke branch main dan lakukan pull request

## Workflow with JIRA
1. Buat subtask dari task JIRA
2. assign ke developer 
3. start workflow subtask melalui vs code 
4. pilih transition issue ke inprogress
5. isi informasi yang diperlukan (source branch, nama lokal branch)
6. uncheck Push the new branch to remote
7. klik start
8. jika selesai coding, add,commit,dan merged seperti biasa