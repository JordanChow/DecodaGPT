from collections import defaultdict
from datetime import datetime, timedelta, timezone
import json
import dateparser

existing_appointments = defaultdict(list)
appointments_list = []


def process_existing_appointments():
    with open("./appointments.json") as f:
        data = json.load(f)
        for appointment in data:
            datetime_obj = datetime.fromisoformat(
                appointment["appointment_date"].replace("Z", "+00:00")
            )
            date = datetime_obj.strftime("%Y-%m-%d")
            existing_appointments[date].append(appointment)
            appointments_list.append(appointment)


def is_valid_appointment(new_start, existing_appointments, duration):
    new_end = new_start + timedelta(minutes=duration)

    for ex_apt in existing_appointments:
        ex_start = datetime.fromisoformat(ex_apt["appointment_date"])
        ex_end = ex_start + timedelta(minutes=ex_apt["duration"])

        if (ex_start < new_start < ex_end) or (ex_start < new_end < ex_end):
            return False
    return True


def schedule_appointment(appointment_date, duration=30, reason="Checkup"):
    try:
        if not appointments_list:
            process_existing_appointments()

        simple_date = dateparser.parse(appointment_date).strftime("%Y-%m-%d")
        filtered_appts = existing_appointments[simple_date]

        if is_valid_appointment(
            datetime.fromisoformat(appointment_date), filtered_appts, duration
        ):
            new_appointment = {
                "appointment_date": appointment_date,
                "duration": duration,
                "title": reason,
                "patient_name": "New Patient",
            }
            appointments_list.append(new_appointment)
            existing_appointments[simple_date].append(new_appointment)

            with open("./appointments.json", "w") as file:
                json.dump(appointments_list, file, indent=4)
            return "Thank you, your appointment has been scheduled. See you there!"

        return "Unable to schedule appointment due to time conflict, please try a different date or time."
    except Exception:
        return (
            "Unable to schedule appointment. Please verify the date and time is valid."
        )
