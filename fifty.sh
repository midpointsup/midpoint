#!/bin/bash

URL="http://localhost:3000/api/users/signup"

for i in {1..50}; do
    username="h$(printf 'i%.0s' $(seq 1 $i))"
    email="h$(printf 'i%.0s' $(seq 1 $i))@example.com"
    DATA="{\"username\": \"$username\", \"email\": \"$email\"}"
    RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$DATA" "$URL")
    echo "$i: $RESPONSE"
done
