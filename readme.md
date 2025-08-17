# APP-CHAT

## Stack 
- server : Go Fiber 
- Web    : Typescript 
- DB     : sqlite3

## install backend
- cd server
- go mod tidy
- go run ./cmd/api

## install frontend
- cd web
- npm install
- npm run dev

## user login 
- user: alice, bob, charlie (pilih salah satu)
- pass: 123456

## API User List 
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/alias
- GET /api/users
- POST /api/create/user


## Workflow 
1. makesure main di lokal selalu update -> git checkout main && git pull origin main
2. jika mau update, bikin branch baru -> git checkout -b namabranch (namatask-namadeveloper)
3. setelah selesai coding, add, commit, and push ke branch baru 
4. req pull request di GitHub, merged branch baru ke main 
5. pastikan tidak ada conflict dan hapus branch tersebut
6. git switch main untuk pindah ke branch main dan lakukan pull request