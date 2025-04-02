import React, { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const RoverGraph = () => {
  const [roverData, setRoverData] = useState([]);

  useEffect(() => {
    fetch("https://fleetbots-production.up.railway.app/api/fleet/status?session_id=49dd464f-0516-40aa-894c-91455e9eacf9")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Data:", data); // Debugging Step 1: Log API Response

        const formattedData = Object.keys(data)
          .map((key, index) => {
            const coords = data[key].coordinates;
            if (!coords || coords.length !== 2) {
              console.warn(`Skipping ${key} due to missing/invalid coordinates`);
              return null;
            }
            return {
              name: key,
              x: coords[0],
              y: coords[1],
              color: getColor(index),
            };
          })
          .filter(Boolean); // Remove null values

        console.log("Formatted Data:", formattedData); // Debugging Step 2: Check if data is structured correctly

        setRoverData(formattedData);
      })
      .catch((err) => console.error("Error fetching rover data:", err));
  }, []);

  const getColor = (index) => {
    const colors = ["red", "blue", "green", "orange", "purple", "cyan"];
    return colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" name="X Coordinate" />
        <YAxis type="number" dataKey="y" name="Y Coordinate" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />

        {roverData.map((rover) => (
          <Scatter
            key={rover.name}
            name={rover.name}
            data={[{ x: rover.x, y: rover.y }]}
            fill={rover.color}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default RoverGraph;
