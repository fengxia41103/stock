FROM python:3.8
ENV PYTHONUNBUFFERED 1
ENV DJANGO_REDIS_HOST "redis"

# Install system packages
RUN apt-get update && apt-get install -y \
    memcached \
    libmemcached-dev

# Upgrade pip
RUN pip install --upgrade pip

# For some strange reason, this is required before
# we hit `pip install -r`
RUN pip install requests gunicorn

# Set up code destination
RUN mkdir /code
COPY . /code
WORKDIR /code

# Install dependencies
ADD requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 80

CMD ["gunicorn", "--bind", ":80", "fin.wsgi"]
