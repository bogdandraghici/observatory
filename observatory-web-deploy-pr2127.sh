#!/bin/bash

# Set the desired Kubernetes context
kubectl config use-context gke_prj-dev-d-flowxai-devinf-58d5_europe-west1-d_dev-cls1

# Apply observatory-api
kubectl apply -f observatory-web-deployment-pr2127.yaml
kubectl apply -f observatory-web-ingress-pr2127.yaml


# Cleanup HPAs if not needed
kubectl delete hpa observatory-web -n dev-pr2127 --ignore-not-found

kubectl get pods -n dev-pr2127 -l 'app in (observatory-web)'
