Title: Dev & Deployment
Date: 2021-09-21 11:0
Slug: dev and deployment
Author: Feng Xia

Both the backend and the frontend have been dockerized. Thus,
regardless your platform, install Docker & `docker-compose` first.

## For user

1. Clone the [repo][1].
2. Go to the project root folder, `docker-compose up --build -d`.
3. Create a backend admin user: `docker-compose run web python
   manage.py createsuperuser`, and follow the instructions. Email is
   optional.
4. Go to browser `http://localhost:8084`, and use the user account to
   login.

Now you should be ready to use the application by adding stocks and
sectors.

## For developers

### Modify code

Using the docker way is preferred. Code will be mounted into the
docker as `volume` (see `docker-compose.yaml` for details). Thus
changes done on your local editor will be reflected in the running
docker as `live`.

### Debugging

It may sound 1980. But the most effective way is to use
`docker-compose logs -f <service name>` to see stack trace and/or
error messages.

### Testing

Looking for **volunteers**!!


### networks

Network of the setup is fairly simple. We distinguish `data` vs. `management`:

<figure class="col s12 center">
  <img src="images/backend%20network.png"/>
  <figcaption>Stock app networks</figcaption>
</figure>

### ports

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

## Build and deploy for k8s & multi-tenancy

### image & multi-tenancy

**Backend image is universal**. All critical settings are
parameterized so that it can be point to different DB & redis based on
launching values. This makes multi-tenancy easy as each client can get
their own backend stack. API is exposed through ingress, thus client A
can have `mystock.a.backend.feng.local`, and so on.

**Frontend image is tenant specific**, because its backend location
value is embedded at image build. Thus, it is **static**. By using
different _frontend env_ file at build, we create a docker image, then
**must tag it correctly** to identify it as image for "client A", for
example, `frontend_stock:v1.1.0.client-a`. Here you may feel a catch
22, that backend API's url _is not yet known_ at this point! However,
it can be **pre-defined**, eg. `mystock.a.backend.feng.local`, and
this same value will be used as backend's ingress (see section
below). Therefore, this **exact value** is used to build this client's
**matching frontend**!

### Harbor

Deploying it to k8s requires pushing docker image to a registry. If
using harbor, tag the image as below then push:

```
docker image tag aa3c3f2a0e29 \
  <harbor url>/<project>/frontend_stock:v1.1.0.local

docker image push \
  <harbor url>/<project>/frontend_stock:v1.1.0.local
```

### deploy backend to k8s

Let's assume I'm deploying for client A. Thus, creating a namespace
`client-a`.

Now, go to `/backend/k8s`.

1. Setup configmap & secret. They hold the backend configurations.

      ```
      # configmap

      kubectl create configmap \
        stock-backend-env \
        --from-env-file=config-dotenv

      # secret

      kubectl create secret generic \
        stock-backend-secret \
        --from-env-file=secret-dotenv
      ```
2. Deploy backend w/ ingress value. **Must** use `-f ..../values.yml`
   so these values can be parameterized!

      ```
      helm install stock-backend-api helm-stock-backend-api \
        -n client-a \
        -f helm-stock-backend-api/values.yaml \
        --set "ingress.hosts[0].host=mystock.a.backend.feng.local"
      ```

### deploy frontend to k8s

As mentioned earlier, if backend's ingress is
`mystock.a.backend.feng.local`, you should have built the frontend
image using this as its dotenv. I'm now assuming the image has been:
built, tagged as `v1.1.0.client-a`, and pushed.

Now, go to `/frontend/k8s`.

```
helm install stock-frontend helm \
  -n client-a \
  -f helm/profiles/client-a.yaml \
  --set image.tag="v1.1.0.client-a"
```

whereas:

- `profiles/client-a.yaml`: has the ingress,
  eg. `mystock.a.feng.local`. this is the frontend's entry URL.

- `image.tag`: self-explanatory.

[1]: https://github.com/fengxia41103/stock
[2]: https://docs.docker.com/compose/compose-file/compose-file-v3/#ports
