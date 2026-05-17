# Kubernetes Manifests

This directory contains Kubernetes manifests for the productivity platform.

## Services

- **frontend** — Next.js application (port 3000)
- **backend** — FastAPI application (port 8000)
- **mysql** — MySQL 8.0 database (port 3306)

## Apply Manifests

```bash
# Create namespace
kubectl create namespace productivity

# Apply all manifests
kubectl apply -f k8s/ -n productivity

# Check status
kubectl get pods -n productivity
kubectl get svc -n productivity
```

## Secrets

Create the MySQL secret before deploying:

```bash
kubectl create secret generic mysql-secret \
  --from-literal=root-password=rootpassword \
  -n productivity
```
