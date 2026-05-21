#!/bin/bash
# Firestore automated export script for Disaster Recovery

PROJECT_ID="your-project-id"
BUCKET_NAME="gs://$PROJECT_ID-firestore-backup"

# Ensure the bucket exists
gsutil ls -b $BUCKET_NAME || gsutil mb -l asia-east1 $BUCKET_NAME

# Trigger Firestore Export
gcloud firestore export $BUCKET_NAME \
  --project=$PROJECT_ID \
  --async

echo "Firestore backup initiated to $BUCKET_NAME"
# Note: In production, automate this using Cloud Scheduler + Cloud Functions to run daily/hourly.
