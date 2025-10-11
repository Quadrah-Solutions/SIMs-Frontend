import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Here you would typically handle authentication logic
      alert(`Logged in as ${email}`);
    } catch (error) {
      setError("Failed to log in. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card title="Clinic Sign In" className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., nurse@clinic.com"
            required
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white p-3 rounded-lg font-semibold hover:bg-emerald-700 transition duration-150 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Demo Users: (nurse@clinic.com or admin@clinic.com) / password123
          </p>
        </div>
      </Card>
    </div>
  );
}
