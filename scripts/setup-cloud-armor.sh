#!/bin/bash
# Enterprise Cloud Armor WAF Configuration for Cloud Run

PROJECT_ID="your-project-id"
REGION="asia-east1"
SECURITY_POLICY_NAME="apex-waf-policy"
BACKEND_SERVICE_NAME="apex-backend"

# 1. Create a security policy
gcloud compute security-policies create $SECURITY_POLICY_NAME \
    --description "WAF policy to protect Cloud Run Apex App"

# 2. Add pre-configured OWASP Top 10 rules
# SQL Injection protection
gcloud compute security-policies rules create 1000 \
    --security-policy $SECURITY_POLICY_NAME \
    --expression "evaluatePreconfiguredExpr('sqli-v33-stable')" \
    --action "deny-403" \
    --description "Block SQL Injection"

# Cross-site Scripting (XSS)
gcloud compute security-policies rules create 1001 \
    --security-policy $SECURITY_POLICY_NAME \
    --expression "evaluatePreconfiguredExpr('xss-v33-stable')" \
    --action "deny-403" \
    --description "Block XSS"
    
# Local File Inclusion (LFI)
gcloud compute security-policies rules create 1002 \
    --security-policy $SECURITY_POLICY_NAME \
    --expression "evaluatePreconfiguredExpr('lfi-v33-stable')" \
    --action "deny-403" \
    --description "Block LFI"
    
# Remote Code Execution (RCE)
gcloud compute security-policies rules create 1003 \
    --security-policy $SECURITY_POLICY_NAME \
    --expression "evaluatePreconfiguredExpr('rce-v33-stable')" \
    --action "deny-403" \
    --description "Block RCE attacks"

# 3. Add Rate Limiting at Edge level (mitigate Layer 7 DDoS before hitting Cloud Run)
gcloud compute security-policies rules create 100 \
    --security-policy $SECURITY_POLICY_NAME \
    --expression="request.path.matches('/api/.*')" \
    --action=throttle \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --conform-action=allow \
    --exceed-action=deny-429 \
    --enforce-on-key=IP

# 4. Attach Security Policy to Backend Service 
# (assuming you have a Global HTTP(S) Load Balancer in front of Cloud Run)
gcloud compute backend-services update $BACKEND_SERVICE_NAME \
    --security-policy $SECURITY_POLICY_NAME \
    --global

echo "Successfully configured Cloud Armor WAF and Edge Rate Limiting!"
