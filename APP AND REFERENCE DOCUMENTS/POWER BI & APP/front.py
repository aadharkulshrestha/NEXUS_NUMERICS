from customtkinter import *
import mysql.connector as m
import tkinter.messagebox as messagebox
import requests
import csv
from datetime import datetime
import os

con = m.connect(host="localhost", username="root", password="karthik", database="hackathon")
cur = con.cursor()

API_BASE_URL = "https://fleetbots-production.up.railway.app/api/rover/"
SESSION_ID = "49dd464f-0516-40aa-894c-91455e9eacf9"


def store_data_in_db(rover_name, data):
    try:
        fleet_status = fetch_fleet_status(rover_name)  # Fetch and extract status

        temperature = data.get("temperature")  # Extract temperature
        soil_moisture = data.get("soil_moisture")  # Extract soil moisture

        # ✅ Ensure all extracted values are simple types
        if isinstance(fleet_status, dict):
            print("❌ ERROR: 'fleet_status' is still a dictionary. Extract the correct key!")
            return

        query = """
        INSERT INTO rover (rover_name, temperature, soil_moisture, status, timestamp)
        VALUES (%s, %s, %s, %s, NOW())
        """
        values = (rover_name, temperature, soil_moisture, fleet_status)

        cur.execute(query, values)
        con.commit()
        print(f"✅ Data stored in DB for {rover_name}")

    except m.Error as err:
        print(f"❌ Error inserting data into MySQL: {err}")


def save_data_to_csv(rover_name, data):
    filename = "rover_data.csv"
    file_exists = os.path.isfile(filename)

    fleet_status = fetch_fleet_status(rover_name)

    with open(filename, mode="a", newline="") as file:
        writer = csv.writer(file)

        # Write header only if file does not exist
        if not file_exists:
            writer.writerow(["Rover Name", "Temperature", "Soil Moisture", "Status", "Timestamp"])

        # Write data row
        writer.writerow([
            rover_name,
            data.get("temperature", None),
            data.get("soil_moisture", None),
            fleet_status,  # Status now comes before timestamp
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])

    print(f"Data saved to CSV for {rover_name}")



def send_task_request(rover_name, task):
    url = f"{API_BASE_URL}{rover_name}/task?session_id={SESSION_ID}&task={task}"
    response = requests.post(url, headers={"Content-Type": "application/json"})
    print(f"{rover_name} is performing {task}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json().get('message', 'No response')}")


def send_movement_request(rover_name, direction):
    url = f"{API_BASE_URL}{rover_name}/move?session_id={SESSION_ID}&direction={direction}"
    response = requests.post(url, headers={"Content-Type": "application/json"})

    print(f"{rover_name} moving {direction}")
    print(f"Status Code: {response.status_code}")
    print(f"Full Response: {response.text}")  # Print the raw response

def send_reset_request(rover_name):
    url = f"{API_BASE_URL}{rover_name}/reset?session_id={SESSION_ID}"
    response = requests.post(url, headers={"Content-Type": "application/json"})
    print(f"Resetting {rover_name}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json().get('message', 'No response')}")


def fetch_sensor_data(rover_name):
    url = f"{API_BASE_URL}{rover_name}/sensor-data?session_id={SESSION_ID}"
    response = requests.get(url, headers={"Content-Type": "application/json"})

    if response.status_code == 200:
        data = response.json()
        print(f"📌 Sensor Data received for {rover_name}: {data}")  # Debugging line

        store_data_in_db(rover_name, data)  # Store in DB
        save_data_to_csv(rover_name, data)  # Store in CSV

        return data
    else:
        print("❌ Failed to fetch sensor data")
        return {"error": "Failed to fetch data"}


def fetch_fleet_status(rover_name):
    url = f"{API_BASE_URL}{rover_name}/status?session_id={SESSION_ID}"
    response = requests.get(url, headers={"Content-Type": "application/json"})

    if response.status_code == 200:
        fleet_status = response.json()
        print(f"📌 Fleet Status received: {fleet_status}")  # Debugging line

        # Extract a specific field (Modify this based on the actual API structure)
        status_value = fleet_status.get("status")  # Change "status" to the correct key in your API response

        if not status_value:
            print("❌ Warning: 'status' field not found in fleet_status response")
            return "Unknown"  # Default value if missing

        return status_value
    else:
        print("❌ Failed to fetch fleet status")
        return "Error"


def check_rover_tasks():
    rovers = {
        "Rover-1": rover1.get(),
        "Rover-2": rover2.get(),
        "Rover-3": rover3.get(),
        "Rover-4": rover4.get(),
        "Rover-5": rover5.get()
    }

    md = CTkFrame(tas)
    md.pack()

    for rover, task in rovers.items():
        send_task_request(rover, task)
        CTkLabel(md, text=f"{rover} is performing {task}", font=("Arial", 30, "bold")).pack(pady=10)


def tasking():
    global tas, mid, rover1, rover2, rover3, rover4, rover5
    tas = CTk()
    to = CTkFrame(tas)
    to.pack()
    CTkLabel(to, text="TASK MANAGEMENT", font=("Arial", 40, "bold")).pack()
    mid = CTkFrame(tas)
    mid.pack()

    task_options = ["Soil Analysis", "Irrigation", "Weeding","Crop Monitoring"]

    rover1 = CTkComboBox(mid, values=task_options, font=("Arial", 30, "bold"))
    rover2 = CTkComboBox(mid, values=task_options, font=("Arial", 30, "bold"))
    rover3 = CTkComboBox(mid, values=task_options, font=("Arial", 30, "bold"))
    rover4 = CTkComboBox(mid, values=task_options, font=("Arial", 30, "bold"))
    rover5 = CTkComboBox(mid, values=task_options, font=("Arial", 30, "bold"))

    for i, rover in enumerate([rover1, rover2, rover3, rover4, rover5]):
        CTkLabel(mid, text=f"Rover {i + 1}", font=("Arial", 30, "bold")).grid(row=i, column=0,pady=10)
        rover.grid(row=i, column=1)

    CTkButton(mid, text="Submit", font=("Arial", 30, "bold"), width=30, command=check_rover_tasks).grid(row=5, column=0,
                                                                                                        columnspan=2)
    tas.mainloop()


def rover_movement():
    global movement_window, rover1_move, rover2_move, rover3_move, rover4_move, rover5_move
    movement_window = CTk()
    movement_window.title("Rover Movement")

    move_options = ["forward", "backward", "left", "right"]
    movement_frame = CTkFrame(movement_window)
    movement_frame.pack()

    for i in range(5):
        CTkLabel(movement_frame, text=f"Rover {i + 1}", font=("Arial", 30, "bold")).grid(row=i, column=0)
        globals()[f'rover{i + 1}_move'] = CTkComboBox(movement_frame, values=move_options, font=("Arial", 30, "bold"))
        globals()[f'rover{i + 1}_move'].grid(row=i, column=1)

    def send_movements():
        rovers = {
            "Rover-1": rover1_move.get(),
            "Rover-2": rover2_move.get(),
            "Rover-3": rover3_move.get(),
            "Rover-4": rover4_move.get(),
            "Rover-5": rover5_move.get()
        }
        for rover, direction in rovers.items():
            send_movement_request(rover, direction)

    CTkButton(movement_frame, text="Move", font=("Arial", 30, "bold"), width=30, command=send_movements).grid(row=5,
                                                                                                              column=0,
                                                                                                              columnspan=2)
    movement_window.mainloop()


def rover_reset():
    global reset_window, rover_reset_select
    reset_window = CTk()
    reset_window.title("Rover Reset")

    reset_frame = CTkFrame(reset_window)
    reset_frame.pack()

    CTkLabel(reset_frame, text="Select Rover", font=("Arial", 30, "bold")).pack()
    rover_reset_select = CTkComboBox(reset_frame, values=["Rover-1", "Rover-2", "Rover-3", "Rover-4", "Rover-5"],
                                     font=("Arial", 30, "bold"))
    rover_reset_select.pack()

    def reset_rover():
        send_reset_request(rover_reset_select.get())

    CTkButton(reset_frame, text="Reset", font=("Arial", 30, "bold"), command=reset_rover).pack()
    reset_window.mainloop()


def rover_sensor_data():
    global sensor_window, rover_sensor_select, sensor_output
    sensor_window = CTk()
    sensor_window.title("Rover Sensor Data")

    sensor_frame = CTkFrame(sensor_window)
    sensor_frame.pack()

    CTkLabel(sensor_frame, text="Select Rover", font=("Arial", 30, "bold")).pack()
    rover_sensor_select = CTkComboBox(sensor_frame, values=["Rover-1", "Rover-2", "Rover-3", "Rover-4", "Rover-5"],
                                      font=("Arial", 30, "bold"))
    rover_sensor_select.pack()

    sensor_output = CTkLabel(sensor_frame, text="", font=("Arial", 20, "bold"))
    sensor_output.pack()

    def get_sensor_data():
        data = fetch_sensor_data(rover_sensor_select.get())
        sensor_output.configure(text=str(data))

    CTkButton(sensor_frame, text="Fetch Data", font=("Arial", 30, "bold"), command=get_sensor_data).pack()
    sensor_window.mainloop()

def fleet_status():
    global fleet_window, rover_fleet_select, fleet_output
    fleet_window = CTk()
    fleet_window.title("Fleet Status")

    fleet_frame = CTkFrame(fleet_window)
    fleet_frame.pack()

    # Label for the selection dropdown
    CTkLabel(fleet_frame, text="Select Rover", font=("Arial", 30, "bold")).pack()

    # ComboBox to select the rover
    rover_fleet_select = CTkComboBox(fleet_frame, values=["Rover-1", "Rover-2", "Rover-3", "Rover-4", "Rover-5"], font=("Arial", 30, "bold"))
    rover_fleet_select.pack()

    # Label to display the fleet status output
    fleet_output = CTkLabel(fleet_frame, text="", font=("Arial", 20, "bold"))
    fleet_output.pack()

    # Function to fetch and display fleet status of the selected rover
    def get_fleet_status():
        selected_rover = rover_fleet_select.get()  # Get the selected rover
        data = fetch_fleet_status(selected_rover)  # Fetch fleet status for the selected rover
        fleet_output.configure(text=str(data))  # Update the UI with the fetched data

    # Button to trigger fetching fleet status
    CTkButton(fleet_frame, text="Fetch Fleet Status", font=("Arial", 30, "bold"), command=get_fleet_status).pack()

    fleet_window.mainloop()



def dashboard():
    middle.destroy()
    bottom.destroy()
    appearance_switch.destroy()
    middl = CTkFrame(w)
    middl.pack()
    CTkButton(middl, text="Task Manager", font=("Arial", 30, "bold"), width=70, command=tasking).pack(padx=5, pady=10)
    CTkButton(middl, text="Rover Movement", font=("Arial", 30, "bold"), width=70, command=rover_movement).pack(padx=5,pady=10)
    CTkButton(middl, text="Reset Rover", font=("Arial", 30, "bold"), width=70, command=rover_reset).pack(padx=5, pady=10)
    CTkButton(middl, text="Soil Status", font=("Arial", 30, "bold"), width=70, command=rover_sensor_data).pack(padx=5, pady=10)
    CTkButton(middl, text="Fleet Status", font=("Arial", 30, "bold"), width=70, command=fleet_status).pack(padx=5, pady=10)



def signin():
    username = un.get()
    password = p.get()
    if username == "" or password == "":
        messagebox.showerror("Error", "Please fill in both fields.")
        return
    query = "SELECT * FROM user WHERE username = %s AND password = %s"
    cur.execute(query, (username, password))
    result = cur.fetchone()
    if result is None:
        messagebox.showerror("Error", "Invalid username or password.")
    else:
        messagebox.showinfo("Success", "Login successful!")
        dashboard()


def signup():
    username = un.get()
    password = p.get()
    if username == "" or password == "":
        messagebox.showerror("Error", "Please fill in both fields.")
        return
    query = "SELECT * FROM user WHERE username = %s"
    cur.execute(query, (username,))
    result = cur.fetchone()
    if result:
        messagebox.showerror("Error", "Username already exists.")
    else:
        insert_query = "INSERT INTO user (username, password) VALUES (%s, %s)"
        cur.execute(insert_query, (username, password))
        con.commit()
        messagebox.showinfo("Success", "Account created successfully!")
        dashboard()


w = CTk()
w.title("Nexus Numerics")


def toggle_appearance_mode():
    current_mode = get_appearance_mode()
    set_appearance_mode("Dark" if current_mode == "Light" else "Light")


top = CTkFrame(w)
top.pack(pady=(20, 10), padx=20, anchor="n")
CTkLabel(top, text="Nexus Numerics", font=("Arial", 80, "bold")).pack()

middle = CTkFrame(w)
middle.pack(pady=10, padx=20, anchor="n")
CTkLabel(middle, text="Username", font=("Arial", 20, "bold")).grid(row=0, column=0, padx=10, pady=10, sticky="e")
CTkLabel(middle, text="Password", font=("Arial", 20, "bold")).grid(row=1, column=0, padx=10, pady=10, sticky="e")
un = CTkEntry(middle, font=("Arial", 20, "bold"), width=300, placeholder_text="Enter your Username")
un.grid(row=0, column=1, padx=10, pady=10)
p = CTkEntry(middle, font=("Arial", 20, "bold"), width=300, placeholder_text="Enter your Password", show="*")
p.grid(row=1, column=1, padx=10, pady=10)

bottom = CTkFrame(w)
bottom.pack(pady=20, padx=20, anchor="n")
CTkButton(bottom, text="Sign In", font=("Arial", 20, "bold"), command=signin).pack(fill="x", pady=5, padx=20)
CTkButton(bottom, text="Sign Up", font=("Arial", 20, "bold"), command=signup).pack(fill="x", pady=5, padx=20)

appearance_switch = CTkSwitch(w, text="Dark Mode", command=toggle_appearance_mode)
appearance_switch.pack(pady=20, padx=20, anchor="n")

w.mainloop()