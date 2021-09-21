Title: Dev & Deployment
Date: 2021-09-21 11:0
Slug: dev and deployment
Author: Feng Xia

Both the backend and the frontend have been dockerized. Thus,
regardless your platform, install Docker & `docker-compose` first.

## Initial setup

1. Clone the [repo][1].
2. Go to the project root folder, `docker-compose up --build -d`.
3. Create a backend admin user: `docker-compose run web python
   manage.py createsuperuser`, and follow the instructions.
4. Go to browser `http://localhost:8084`, and use the user account to
   login.

Now you should be ready to use the application by adding stocks and
sectors.

## Ports

I try to limit exposure of ports on docker host so this application
can be easily co-hosted with others without causing port conflicts.
In essence, `8084` is the frontend UI port, and `8003` is the backend
API port. All others are docker-to-docker only.

| Component | Docker Port | Service                             | Host Map |
|-----------|-------------|-------------------------------------|----------|
| Frontend  | 80          | Main frontend app w/ Nginx built-in | 8084     |
| Backend   | 80          | Nginx proxy                         | 8003     |
| Backend   | 3306        | MySql DB                            | none     |
| Backend   | 8001        | Django app                          | none     |
| Backend   | 6379        | Redis                               | none     |

Port mapping can be changed in `docker-compose.yml`. For example, if
to change the frontend proxy from `8084` to `9999`, change the line
`ports` from `8084:80` to `9999:80`. See [`docker-compose` doc][2] for
details.

```yaml
frontend:
  ....
  ports:
    - "8084:80"  # <========= change this line!
  ....
```

[1]: https://github.com/fengxia41103/stock
[2]: https://docs.docker.com/compose/compose-file/compose-file-v3/#ports
