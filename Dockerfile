FROM ubuntu:22.04

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive 

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    python3 \
    python3-pip \
    python3-scipy \
    python3-matplotlib \
    python3-dev \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory to match current structure
WORKDIR /workspace/imdb

# Install Python dependencies
RUN pip3 install --no-cache-dir scipy pandas numpy flask python-dateutil
COPY requirements.txt /workspace/imdb/

RUN cd /workspace/imdb && pip3 install -r requirements.txt

# Download and extract the dataset directly to match path
#RUN wget -q https://data.vision.ee.ethz.ch/cvl/rrothe/imdb-wiki/static/imdb_crop.tar -O /tmp/imdb_crop.tar && \
#    tar -xf /tmp/imdb_crop.tar -C /workspace/imdb && \
#    rm /tmp/imdb_crop.tar

# Copy application files
COPY mat_expanded.py /workspace/imdb/
COPY web/ /workspace/imdb/web/

# Process the dataset - but don't fail the build if it can't process
# This is moved to the entrypoint to run when the container starts
# so it can use the mounted data volume

# Expose the web server port
EXPOSE 5000

# Copy and set up startup script
COPY start.sh /workspace/imdb/start.sh
RUN chmod +x /workspace/imdb/start.sh

# Change working directory
WORKDIR /workspace/imdb

# Set up the entry point
CMD ["/workspace/imdb/start.sh"]
