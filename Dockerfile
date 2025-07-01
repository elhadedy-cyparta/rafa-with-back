# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create and set the working directory
WORKDIR /app

# Install system dependencies, including git
# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#         build-essential \
#         libpq-dev \
#         git \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/* && apt-get install pkg-config python3-dev default-libmysqlclient-dev build-essential

RUN apt-get update && apt-get install -y \
build-essential \
default-libmysqlclient-dev \
pkg-config \
libssl-dev \
libffi-dev \
libmariadb-dev-compat \
libmariadb-dev \
libpq-dev \
git \
iputils-ping \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install Python dependencies
#COPY requirements.txt .
#
## Install Python dependencies
COPY . .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --force-reinstall --exists-action w -r requirements.txt

RUN pip install uvicorn
# RUN pip install django-ckeditor-5
# Copy the rest of the application code#
#COPY . .

RUN mkdir -p /app/logs \
    && chown -R www-data:www-data /app/logs \
    && chmod -R 755 /app/logs
# Expose the port that Uvicorn will run on
EXPOSE 8888
#RUN pwd && ls
### Command to run the application using Uvicorn
# CMD ["uvicorn", "project.asgi:application", "--host", "0.0.0.0", "--port", "8000"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8888", "project.asgi:application"]
