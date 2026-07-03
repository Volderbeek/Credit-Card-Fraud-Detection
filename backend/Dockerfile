# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED=True

# Set the working directory in the container
WORKDIR /app

# Install system packages required for dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file to the container image
COPY backend/requirements.txt ./backend/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy model.pkl (located at root of project context) to the container working directory
COPY model.pkl ./model.pkl

# Copy local backend code to the container working directory
COPY backend/ ./backend/

# Expose port 8080 (default for Cloud Run)
ENV PORT=8080
EXPOSE 8080

# Run the web service on container startup.
# We run gunicorn, binding to 0.0.0.0 on the PORT environment variable.
# For Cloud Run, setting timeout to 0 (disabled) is recommended to let Cloud Run handle timeouts.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 --chdir backend app:app
