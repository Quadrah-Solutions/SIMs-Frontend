import React from "react";
import { useParams } from "react-router-dom";
export default function StudentProfile() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-xl font-semibold">Student {id}</h1>
      <p>Profile details go here.</p>
    </div>
  );
}
