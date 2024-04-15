#!/bin/bash

# Function URL of the search Lambda function
FUNCTION_URL="https://fgucnqizipwo6b3dv4lukk2s240vxfbd.lambda-url.me-south-1.on.aws/"

# Search parameters
QUERY="ERROR"
START_DATE="2024-04-15"
END_DATE="2024-04-23"

# JSON payload for the search request
JSON_PAYLOAD=$(cat <<EOF
{
  "query": "$QUERY",
  "startDate": "$START_DATE",
  "endDate": "$END_DATE"
}
EOF
)

# Send POST request to the search Lambda function
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$JSON_PAYLOAD" "$FUNCTION_URL")

# Print the response
echo "Response:"
echo "$response"