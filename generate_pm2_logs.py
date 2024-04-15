import os
import random
from datetime import datetime, timedelta
import boto3

# Set the name of the log storage bucket
LOG_STORAGE_BUCKET = "raw-log-s3-demo"

# Set the number of log files to generate
NUM_LOG_FILES = 10

# Set the date range for the log files
start_date = datetime.now().date()
end_date = start_date + timedelta(days=NUM_LOG_FILES - 1)

# Create an S3 client
s3 = boto3.client("s3")

# Generate and upload log files
current_date = start_date
while current_date <= end_date:
    # Generate a random number of log entries for each file
    num_entries = random.randint(1, 100)

    # Create a temporary log file
    log_file = f"app-{current_date}.log"
    with open(log_file, "w") as file:
        # Generate log entries
        for _ in range(num_entries):
            timestamp = (
                current_date.strftime("%Y-%m-%d")
                + "T"
                + (datetime.now() + timedelta(seconds=random.randint(0, 86400))).strftime("%H:%M:%SZ")
            )
            log_level = random.choice(["INFO", "ERROR"])
            message = f"Sample log message {random.randint(1, 1000)}"
            file.write(f"{timestamp} {log_level} {message}\n")

    # Upload the log file to the log storage bucket
    s3.upload_file(log_file, LOG_STORAGE_BUCKET, f"application-logs/{current_date}/{log_file}")

    # Remove the temporary log file
    os.remove(log_file)

    # Move to the next date
    current_date += timedelta(days=1)

print(f"Sample PM2 logs generated and uploaded to S3 bucket: {LOG_STORAGE_BUCKET}")