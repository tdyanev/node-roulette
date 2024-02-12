#!/bin/bash

# Check if the argument is provided
if [ "$#" -ne 2 ] || [ "$1" != "--count" ]; then
    echo "Usage: $0 --count <number_of_players>"
    exit 1
fi

count="$2"

# Create a temporary SQL file
tempFile=$(mktemp)

echo "USE roulette;" >> "$tempFile"

for ((i = 1; i <= count; i++)); do
    username="user$(date +%s)_$i"  # Appending timestamp to ensure uniqueness
    balance=$((RANDOM % 1000 + 100))
    echo "INSERT INTO players (username, balance) VALUES ('$username', $balance);" >> "$tempFile"
done


mysql -u root -p < "$tempFile"
rm -f "$tempFile"

echo "Players populated successfully."