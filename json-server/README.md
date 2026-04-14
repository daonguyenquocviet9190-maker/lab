# JSON Server Fake REST API

Project nay da duoc them `json-server` de chay fake REST API tu cac file trong `src/data`.

## Chay server

```bash
npm install
npm run fake-api
```

Mac dinh server chay tai:

```text
http://localhost:3001
```

## Tai nguyen REST

- `GET /products`
- `GET /lipsticks`
- `GET /perfumes`
- `GET /blogPosts`
- `GET /users`
- `GET /orders`
- `GET /reviews`

## CRUD co san

- `GET /resource`
- `GET /resource/:id`
- `POST /resource`
- `PATCH /resource/:id`
- `DELETE /resource/:id`

Vi du:

```bash
GET http://localhost:3001/products
GET http://localhost:3001/orders?email=test@gmail.com
GET http://localhost:3001/reviews?productKey=gift-1
POST http://localhost:3001/orders
PATCH http://localhost:3001/orders/123
DELETE http://localhost:3001/reviews/456
```

## Tim kiem va filter

Co ho tro:

- `?q=tu-khoa`
- `?_sort=field&_order=asc`
- `?_page=1&_limit=10`
- `?email=...`
- `?productKey=...`

Du lieu van doc/ghi truc tiep vao cac file trong `src/data`.
