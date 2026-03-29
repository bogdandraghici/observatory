#!/bin/bash
set -e

# Set your desired tag
TAG=2.0.14
NAMESPACE=dev-pr2127

# Enable BuildKit for faster builds with caching
export DOCKER_BUILDKIT=1
# Authenticate Docker with Google Artifact Registry
gcloud auth configure-docker europe-docker.pkg.dev

# Build the Docker image locally
docker build \
    --platform linux/amd64 \
    --progress=plain \
    -t europe-docker.pkg.dev/flowxai-sandbox/ai/observatory-web:$TAG \
    .

# Push the image to Artifact Registry
docker push europe-docker.pkg.dev/flowxai-sandbox/ai/observatory-web:$TAG

# Delete existing deployment and service (ignore errors if not found)
echo "Cleaning up existing observatory-web in $NAMESPACE..."
kubectl delete deployment observatory-web -n $NAMESPACE --ignore-not-found
kubectl delete service observatory-web -n $NAMESPACE --ignore-not-found

# Deploy to Kubernetes
echo "Deploying observatory-web to $NAMESPACE..."
kubectl apply -f observatory-web-deployment-pr2127.yaml
kubectl apply -f observatory-web-ingress-pr2127.yaml