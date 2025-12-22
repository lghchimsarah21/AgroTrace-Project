FROM python:3.9

WORKDIR /app

# Install system dependencies required for your packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Upgrade pip and install packages in stages
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install numpy first (many packages depend on it)
RUN pip install --no-cache-dir "numpy==1.23.5"

# Install other packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port your Flask app runs on
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]