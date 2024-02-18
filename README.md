# Welcome to DecodaGPT

Your personalized AI assistant with the ability to answer questions and schedule appointments.

## Features

<ins>Ask it anything!</ins>

- What is 65 \* 243?
- Write me a rap song using references to SpongeBob SquarePants.

<ins>Schedule an appointment</ins>

- Make a 1 hour appointment for Feb 24, 2024 at 10pm for my foot injury
- Schedule a 20 minute appointment on March 5th at noon for my torn achilles

## Setup

1. Clone the repo locally
2. Add a `.env` file in the backend folder
   1. This file should contain your Open AI api key in the following format:
      OPENAI_API_KEY=insert-api-key-here
3. run `docker-compose up` inside the root folder to start the application.

## Examples

### Schedule an apppointment:

![Make appointment](images/image.png)
![Appointment result](images/image-1.png)

### View and message old chats:

![Alt text](images/image-2.png)

### Ask general questions:

![Alt text](images/image-3.png)

### View all appointments

![Alt text](images/image-4.png)
![Alt text](images/image-5.png)
