import asyncio
import json
from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from app.schedule_appointments import schedule_appointment
from app.models import Message, Role, RunStatus, Thread
from dotenv import load_dotenv
import time
from scripts import generate_appointments

load_dotenv()

tools = [
    {
        "type": "function",
        "function": {
            "name": "schedule_appointment",
            "description": "Schedule an appointment",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_date": {
                        "type": "string",
                        "description": "Date time string in the following format: %Y-%m-%dT%H:%M:%SZ using local time. The current year is 2024. Ensure today's date is set correctly.",
                    },
                    "duration": {
                        "type": "integer",
                        "description": "Length of appointment in minutes.",
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for the appointment visit.",
                    },
                },
                "required": ["appointment_date"],
            },
        },
    }
]

openai = OpenAI()
assistant = openai.beta.assistants.create(
    name="Personal Assistant",
    instructions="You are a personal assistant. Answer any question or request the user has.",
    tools=tools,
    model="gpt-3.5-turbo",
)
ASSISTANT_ID = assistant.id

# Global thread index
THREAD_NUM = 1
lock = asyncio.Lock()

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local copy of threads (no get threads endpoint from openai)
threads: Dict[str, Thread] = {}


def wait_on_run(run, thread_id):
    while run.status == RunStatus.QUEUED or run.status == RunStatus.IN_PROGRESS:
        run = openai.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id,
        )
        time.sleep(1)

    if run.status in [
        RunStatus.CANCELLED,
        RunStatus.EXPIRED,
        RunStatus.FAILED,
        RunStatus.CANCELLING,
    ]:
        raise HTTPException(status_code=500, detail="Failed to recieve response.")
    return run


def process_run(thread_id):
    run = openai.beta.threads.runs.create(
        thread_id=thread_id, assistant_id=ASSISTANT_ID
    )
    run = wait_on_run(run, thread_id)

    if run.status == RunStatus.COMPLETED:
        messages = openai.beta.threads.messages.list(thread_id=thread_id)
        for message in messages:
            if message.run_id == run.id:
                threads[thread_id].messages.append(message)
                return message.content[0].text.value

    elif run.status == RunStatus.REQUIRES_ACTION:
        tool_call = run.required_action.submit_tool_outputs.tool_calls[0]
        args = json.loads(tool_call.function.arguments)

        scheduling_outcome = schedule_appointment(**args)

        # Notify openai the function is complete and update the output
        run = openai.beta.threads.runs.submit_tool_outputs(
            thread_id=thread_id,
            run_id=run.id,
            tool_outputs=[{"tool_call_id": tool_call.id, "output": scheduling_outcome}],
        )
        run = wait_on_run(run, thread_id)

        # Unpack message response
        messages = openai.beta.threads.messages.list(thread_id=thread_id)
        for message in messages:
            if message.run_id == run.id and message.role == Role.ASSISTANT:
                threads[thread_id].messages.append(message)
                return message.content[0].text.value
    return ""


@app.get("/threads/{thread_id}", tags=["threads"])
async def get_thread(thread_id: str) -> Thread:
    try:
        return threads[thread_id]
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Thread not found. Error: {e}")


@app.get("/threads", tags=["threads"])
async def get_threads() -> list:
    return list(threads.values())


@app.delete("/threads/{thread_id}", tags=["threads"])
async def delete_thread(thread_id: str):
    global THREAD_NUM
    try:
        openai.beta.threads.delete(thread_id)
        del threads[thread_id]
        async with lock:
            THREAD_NUM -= 1

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete thread. Error: {e}"
        )


@app.post("/threads", tags=["threads"])
async def create_thread_and_send_message(original_message: Message):
    global THREAD_NUM
    try:
        thread = openai.beta.threads.create()
        message = openai.beta.threads.messages.create(
            thread_id=thread.id,
            role=original_message.role,
            content=original_message.content,
        )

        async with lock:
            threads[thread.id] = Thread(
                id=thread.id,
                name=f"Chat #{str(THREAD_NUM)}",
                created_at=thread.created_at,
                messages=[message],
            )
            THREAD_NUM += 1

        reply = process_run(thread.id)
        return Message(
            role=Role.ASSISTANT,
            content=reply,
            thread_id=thread.id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create thread. Error: {e}"
        )


@app.post("/threads/{thread_id}/messages", tags=["messages"])
async def create_message(thread_id: str, message: Message):
    try:
        message_object = openai.beta.threads.messages.create(
            thread_id=thread_id,
            role=message.role,
            content=message.content,
        )
        threads[thread_id].messages.append(message_object)
        reply = process_run(thread_id)

        return Message(role=Role.ASSISTANT, content=reply, thread_id=thread_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=f"Thread id not found. Error: {e}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create message. Error: {e}"
        )


@app.get("/appointments", tags=["appointments"])
async def get_appointments():
    return FileResponse("./appointments.json")
