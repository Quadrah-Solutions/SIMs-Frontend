import React from "react";
import { useNavigate } from "react-router-dom";
export default function Students() {
  const nav = useNavigate();
  const students = [
    { id: 1, name: "Ama Mensah" },
    { id: 2, name: "Kofi Asante" },
  ];
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Students</h1>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="p-3 bg-white rounded shadow">
            <button
              onClick={() => nav(`/students/${s.id}`)}
              className="text-left"
            >
              {s.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
