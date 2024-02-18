# Welcome to DecodaGPT

Your personalized AI assistant with the ability to answer questions and schedule appointments.

<img src="images/main-image.png"  width="75%" height="75%">

## Setup

1. Clone the repo locally
2. Add a `.env` file in the backend folder
   1. This file should contain your Open AI api key in the following format:
      OPENAI_API_KEY=insert-api-key-here
3. Ensure Docker is running in the background
4. Run `docker-compose up` inside the root folder to start the application (this may take a bit).
5. Once step 4 is complete, go to `http://localhost:3006/` to see DecodaGPT!

If the build fails, try removing the container and images and try again. Use `docker-compose up --build` to rebuild images.

## Features

<ins>Ask it anything!</ins>

- What is 65 \* 243?
- Write me a rap song using references to SpongeBob SquarePants.

<ins>Schedule an appointment</ins>

- Make a 1 hour appointment for Feb 24, 2024 at 10pm for my foot injury
- Schedule a 20 minute appointment on March 5th at noon for my torn achilles

## Examples

### Schedule an apppointment:

<img src="images/image.png"  width="75%" height="75%">

![Appointment result](images/image-1.png)

### View and message old chats:

<img src="images/image-2.png"  width="30%" height="30%">

### Ask general questions:

<img src="images/image-3.png"  width="50%" height="50%">

### View all appointments

![Alt text](images/image-4.png)

<img src="images/image-5.png"  width="50%" height="50%">
