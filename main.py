import os
import sys
import time
import math

# ---------------- SUMO SETUP ---------------- #

if 'SUMO_HOME' in os.environ:
    sys.path.append(os.path.join(os.environ['SUMO_HOME'], 'tools'))
else:
    raise Exception("Set SUMO_HOME")

import traci

TL_ID = "center"

MIN_GREEN = 5
MAX_GREEN = 60
YELLOW = 3
STARVATION_LIMIT = 50

# Improved PCU weights
PCU_WEIGHTS = {
    "bus": 3.5,
    "truck": 3.0,
    "car": 1.0,
    "bike": 0.5,
    "ambulance": 2.0
}

# ---------------- EMERGENCY AGENT ---------------- #

class EmergencyAgent:
    def check(self):
        for v in traci.vehicle.getIDList():
            if traci.vehicle.getVehicleClass(v) == "emergency":
                return traci.vehicle.getLaneID(v)
        return None


# ---------------- TRAFFIC AGENT ---------------- #

class TrafficAgent:
    def __init__(self):
        self.last_served = "EW"
        self.wait_time = {"NS": 0, "EW": 0}

    def get_lanes(self):
        lanes = traci.lane.getIDList()
        NS, EW = [], []

        for lane in lanes:
            if any(x in lane for x in ["N2C", "C2N", "S2C", "C2S"]):
                NS.append(lane)
            else:
                EW.append(lane)

        return NS, EW

    def density(self, lanes):
        total = 0
        for lane in lanes:
            for v in traci.lane.getLastStepVehicleIDs(lane):
                vtype = traci.vehicle.getTypeID(v)
                total += PCU_WEIGHTS.get(vtype, 1.0)
        return total

    # 🔥 Improved Green Time Formula
    def green_time(self, density):
        if density == 0:
            return 0

        alpha = 2.0
        beta = 1.5

        g = MIN_GREEN + alpha * density + beta * math.sqrt(density)

        return min(MAX_GREEN, g)

    def decide(self, d_ns, d_ew):
        if d_ns == 0 and d_ew == 0:
            return None

        if d_ns == 0:
            return "EW"
        if d_ew == 0:
            return "NS"

        # starvation prevention
        if self.wait_time["NS"] > STARVATION_LIMIT:
            return "NS"
        if self.wait_time["EW"] > STARVATION_LIMIT:
            return "EW"

        # round robin
        return "NS" if self.last_served == "EW" else "EW"

    def update(self, chosen, time_used):
        for g in ["NS", "EW"]:
            if g == chosen:
                self.wait_time[g] = 0
            else:
                self.wait_time[g] += time_used

        self.last_served = chosen


# ---------------- METRICS ---------------- #

class Metrics:
    def __init__(self):
        self.total_wait = 0
        self.vehicle_steps = 0
        self.max_queue = 0
        self.throughput = 0

    def update(self):
        vehicles = traci.vehicle.getIDList()

        for v in vehicles:
            self.total_wait += traci.vehicle.getWaitingTime(v)

        self.vehicle_steps += len(vehicles)

        # queue length
        for lane in traci.lane.getIDList():
            q = traci.lane.getLastStepHaltingNumber(lane)
            self.max_queue = max(self.max_queue, q)

        # throughput
        self.throughput += traci.simulation.getArrivedNumber()

    def report(self):
        avg_wait = self.total_wait / max(1, self.vehicle_steps)

        print("\n📊 PERFORMANCE REPORT")
        print(f"Average Waiting Time: {avg_wait:.2f} sec")
        print(f"Max Queue Length: {self.max_queue}")
        print(f"Throughput (vehicles cleared): {self.throughput}")


# ---------------- MAIN ---------------- #

def run():

    traci.start([
        "C:/Program Files (x86)/Eclipse/Sumo/bin/sumo-gui.exe",
        "-c", "C:/Users/ravur_48/OneDrive/Desktop/traffic_project/traffic.sumocfg",
        "--start"
    ])

    emergency = EmergencyAgent()
    agent = TrafficAgent()
    metrics = Metrics()

    while traci.simulation.getMinExpectedNumber() > 0:

        # 🚑 Emergency priority
        lane = emergency.check()
        if lane:
            print("🚑 Emergency detected!")

            phase = 0 if any(x in lane for x in ["N", "S"]) else 2
            traci.trafficlight.setPhase(TL_ID, phase)

            for _ in range(10):
                traci.simulationStep()
                metrics.update()
                time.sleep(0.05)
            continue

        NS, EW = agent.get_lanes()
        d_ns = agent.density(NS)
        d_ew = agent.density(EW)

        chosen = agent.decide(d_ns, d_ew)

        if chosen is None:
            traci.simulationStep()
            metrics.update()
            continue

        if chosen == "NS":
            phase = 0
            density = d_ns
        else:
            phase = 2
            density = d_ew

        g_time = agent.green_time(density)

        print(f"{chosen} | Density={density:.2f} | Time={g_time:.2f}")

        traci.trafficlight.setPhase(TL_ID, phase)

        for _ in range(int(g_time) + YELLOW):
            traci.simulationStep()
            metrics.update()

            # interrupt if emergency comes
            if emergency.check():
                break

            time.sleep(0.05)

        agent.update(chosen, g_time)

    metrics.report()
    traci.close()


# ---------------- RUN ---------------- #

if __name__ == "__main__":
    run()