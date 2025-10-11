export default function Card({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${className}`}
    >
      {title && (
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
